import assert from 'assert';
import {afterEach} from 'mocha';
import sinon from 'sinon';

import {UserService} from "../../../src/services/userService";
import {UserRepository} from "../../../src/repositories/userRepository";
import bcrypt from 'bcrypt';
import {User} from "../../../src/dto/user/user";
import {UserWithRoles} from "../../../src/dto/user/userWithRoles";
import {AuthenticationError} from "../../../src/errors/authenticationError";
import {DataConflictError} from "../../../src/errors/dataConflictError";
import {UserEntity} from "../../../src/models/userEntity";

describe('UserService', () => {
    let userService: UserService;
    let userRepoStub: sinon.SinonStubbedInstance<UserRepository>;
    let txStub: sinon.SinonStub;
    let bcryptCompareStub: sinon.SinonStub;
    let bcryptHashStub: sinon.SinonStub;

    beforeEach(() => {
        userRepoStub = sinon.createStubInstance(UserRepository);
        txStub = sinon.stub().callsFake(async (callback) => {
            await callback({});
        })

        userService = new UserService(userRepoStub, txStub);

        bcryptCompareStub = sinon.stub(bcrypt, 'compare');
        bcryptHashStub = sinon.stub(bcrypt, 'hash');
    });

    afterEach(() => {
        sinon.restore();
    })

    describe('login', () => {
        it('should authenticate user with correct credentials', async () => {
            const mockUser: UserWithRoles = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedPassword',
                roles: ['user']
            };

            userRepoStub.getWithRolesByLoginOrEmail.resolves(mockUser);
            bcryptCompareStub.resolves(true);

            const result = await userService.login('testuser', 'password123');

            assert.deepEqual(result, mockUser);
            assert.equal(userRepoStub.getWithRolesByLoginOrEmail.callCount, 1);
            assert.equal(bcryptCompareStub.callCount, 1);
        });

        it('should throw an error if user is not found', async () => {
            userRepoStub.getWithRolesByLoginOrEmail.resolves(null);

            await assert.rejects(
                () => userService.login('nonexistent', 'password123'),
                (err) => err instanceof AuthenticationError && err.message === 'Nieprawidłowe email/nazwa użytkownika lub hasło'
            );

            assert.equal(userRepoStub.getWithRolesByLoginOrEmail.callCount, 1);
            assert.equal(bcryptCompareStub.callCount, 0);
        });

        it('should throw an error if password is incorrect', async () => {
            const mockUser: UserWithRoles = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedPassword',
                roles: ['user']
            };

            userRepoStub.getWithRolesByLoginOrEmail.resolves(mockUser);
            bcryptCompareStub.resolves(false);

            await assert.rejects(
                () => userService.login('testuser', 'wrongpassword'),
                (err) => err instanceof AuthenticationError && err.message === 'Nieprawidłowe email/nazwa użytkownika lub hasło'
            );

            assert.equal(userRepoStub.getWithRolesByLoginOrEmail.callCount, 1);
            assert.equal(bcryptCompareStub.callCount, 1);
        });
    });

    describe('register', () => {
        it('should register a new user with hashed password', async () => {
            const mockUser: UserEntity = {
                id: 0,
                username: 'newuser',
                email: 'new@example.com',
                password: 'hashedPassword',
            };

            userRepoStub.getWithoutRolesByLoginOrEmail.resolves(null);
            bcryptHashStub.resolves('hashedPassword');
            userRepoStub.insert.resolves(mockUser);

            await userService.register(
                {username: 'newuser', email: 'new@example.com', password: 'password123'}
            );

            assert.equal(userRepoStub.getWithoutRolesByLoginOrEmail.callCount, 1);
            assert.equal(bcryptHashStub.callCount, 1);
            assert.equal(userRepoStub.insert.callCount, 1);
            assert.deepEqual(userRepoStub.insert.getCall(0).args[0], mockUser);
            assert.equal(userRepoStub.insertUserRoles.callCount, 1);
            assert(userRepoStub.insertUserRoles.calledWithMatch(
                mockUser.id,
                ['user'],
                sinon.match.any
            ));

        });

        it('should throw an error if login is already taken', async () => {
            const existingUser: User = {
                id: 1,
                username: 'existinguser',
                email: 'existing@example.com',
                password: 'hashedPassword',
            };

            userRepoStub.getWithoutRolesByLoginOrEmail.resolves(existingUser);

            await assert.rejects(
                () => userService.register({
                    username: 'existinguser',
                    email: 'new@example.com',
                    password: 'password123'
                }),
                (err) => err instanceof DataConflictError && err.message === 'Już istnieje konto powiązane z tą nazwą użytkownika.'
            );

            assert.equal(userRepoStub.getWithoutRolesByLoginOrEmail.callCount, 1);
            assert.equal(bcryptHashStub.callCount, 0);
            assert.equal(userRepoStub.insert.callCount, 0);
            assert.equal(userRepoStub.insertUserRoles.callCount, 0);
        });

        it('should throw an error if email is already taken', async () => {
            userRepoStub.getWithoutRolesByLoginOrEmail.resolves(
                {
                    id: 1,
                    username: 'otheruser',
                    email: 'existing@example.com',
                    password: 'hashedPassword'
                }
            );

            await assert.rejects(
                () => userService.register({
                    username: 'newUser',
                    email: 'existing@example.com',
                    password: 'password123'
                }),
                (err) => err instanceof DataConflictError && err.message === 'Już istnieje konto powiązane z tym adresem email.'
            );

            assert.equal(userRepoStub.getWithoutRolesByLoginOrEmail.callCount, 1);
            assert.equal(bcryptHashStub.callCount, 0);
            assert.equal(userRepoStub.insert.callCount, 0);
            assert.equal(userRepoStub.insertUserRoles.callCount, 0);
        });
    });
})