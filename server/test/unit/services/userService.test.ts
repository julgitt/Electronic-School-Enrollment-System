import assert from 'assert';
import { afterEach } from 'mocha';
import sinon from 'sinon';

import { UserService } from "../../../src/services/userService";
import { UserRepository } from "../../../src/repositories/userRepository";
import { User } from "../../../src/models/userModel";
import bcrypt from 'bcrypt';


describe('UserService', () => {
    let userService: UserService;
    let userRepoStub: sinon.SinonStubbedInstance<UserRepository>;
    let bcryptCompareStub: sinon.SinonStub;
    let bcryptHashStub: sinon.SinonStub;

    beforeEach(() => {
        userRepoStub = sinon.createStubInstance(UserRepository);

        userService = new UserService(userRepoStub);

        bcryptCompareStub = sinon.stub(bcrypt, 'compare');
        bcryptHashStub = sinon.stub(bcrypt, 'hash');
    });

    afterEach(() => { sinon.restore(); })

    describe('authenticateUser', () => {
        it('should authenticate user with correct credentials', async () => {
            const mockUser: User = {
                id: 1,
                login: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                password: 'hashedPassword',
                roles: ['user']
            };

            userRepoStub.getUserWithRolesByLoginOrEmail.resolves(mockUser);
            bcryptCompareStub.resolves(true);

            const result = await userService.authenticateUser('testuser', 'password123');

            assert.deepEqual(result, mockUser);
            assert.equal(userRepoStub.getUserWithRolesByLoginOrEmail.callCount, 1);
            assert.equal(bcryptCompareStub.callCount, 1);
        });

        it('should throw an error if user is not found', async () => {
            userRepoStub.getUserWithRolesByLoginOrEmail.resolves(null);

            try {
                await userService.authenticateUser('nonexistent', 'password123');
                assert.fail('Expected an error to be thrown');
            } catch (err) {
                assert.equal((err as Error).message, 'Invalid login or password.');
            }

            assert.equal(userRepoStub.getUserWithRolesByLoginOrEmail.callCount, 1);
            assert.equal(bcryptCompareStub.callCount, 0);
        });

        it('should throw an error if password is incorrect', async () => {
            const mockUser: User = {
                id: 1,
                login: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                password: 'hashedPassword',
                roles: ['user']
            };

            userRepoStub.getUserWithRolesByLoginOrEmail.resolves(mockUser);
            bcryptCompareStub.resolves(false);

            try {
                await userService.authenticateUser('testuser', 'wrongpassword');
                assert.fail('Expected an error to be thrown');
            } catch (err) {
                assert.equal((err as Error).message, 'Invalid login or password.');
            }

            assert.equal(userRepoStub.getUserWithRolesByLoginOrEmail.callCount, 1);
            assert.equal(bcryptCompareStub.callCount, 1);
        });
    });

    describe('isUserInRole', () => {
        it('should return true if user is in role', async () => {
            userRepoStub.getUserRoles.resolves(['admin', 'user']);

            const result = await userService.isUserInRole(1, 'admin');
            assert.strictEqual(true, result);
            assert.equal(userRepoStub.getUserRoles.callCount, 1);
        });

        it('should return false if user is not in role', async () => {
            userRepoStub.getUserRoles.resolves(['user']);

            const result = await userService.isUserInRole(1, 'admin');
            assert.strictEqual(false, result);
            assert.equal(userRepoStub.getUserRoles.callCount, 1);
        });
    });

    describe('registerUser', () => {
        it('should register a new user with hashed password', async () => {
            const mockUser: Omit<User, 'id'> = {
                login: 'newuser',
                firstName: 'New',
                lastName: 'User',
                email: 'new@example.com',
                password: 'hashedPassword',
                roles: ['user']
            };

            userRepoStub.getUserByLoginOrEmail.resolves(null);
            bcryptHashStub.resolves('hashedPassword');
            userRepoStub.insertUser.resolves({id: 1, ...mockUser});

            const result = await userService.registerUser('newuser', 'new@example.com', 'New', 'User', 'password123');

            assert.deepEqual(result, {id: 1, ...mockUser});
            assert.equal(userRepoStub.getUserByLoginOrEmail.callCount, 1);
            assert.equal(bcryptHashStub.callCount, 1);
            assert.equal(userRepoStub.insertUser.callCount, 1);
            assert(userRepoStub.insertUser.calledWith(mockUser));
        });

        it('should throw an error if login is already taken', async () => {
            const existingUser: User = {
                id: 1,
                login: 'existinguser',
                firstName: 'Existing',
                lastName: 'User',
                email: 'existing@example.com',
                password: 'hashedPassword',
                roles: ['user']
            };

            userRepoStub.getUserByLoginOrEmail.resolves(existingUser);

            try {
                await userService.registerUser('existinguser', 'new@example.com', 'New', 'User', 'password123');
                assert.fail('Expected an error to be thrown');
            } catch (err) {
                assert.match((err as Error).message, /Login is already taken./);
            }

            assert.equal(userRepoStub.getUserByLoginOrEmail.callCount, 1);
            assert.equal(bcryptHashStub.callCount, 0);
            assert.equal(userRepoStub.insertUser.callCount, 0);
        });

        it('should throw an error if email is already taken', async () => {
            const existingUser: User = {
                id: 1,
                login: 'newuser',
                firstName: 'Existing',
                lastName: 'User',
                email: 'existing@example.com',
                password: 'hashedPassword',
                roles: ['user']
            };

            userRepoStub.getUserByLoginOrEmail.resolves(existingUser);

            try {
                await userService.registerUser('newuser', 'existing@example.com', 'New', 'User', 'password123');
                assert.fail('Expected an error to be thrown');
            } catch (err) {
                //TODO: Instead of multiple messages glued together, throw multiple errors!
                assert.match((err as Error).message, /There is already an account with that email./);
            }

            assert.equal(userRepoStub.getUserByLoginOrEmail.callCount, 1);
            assert.equal(bcryptHashStub.callCount, 0);
            assert.equal(userRepoStub.insertUser.callCount, 0);
        });
    });
})