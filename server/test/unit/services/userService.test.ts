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

            userRepoStub.getByLoginOrEmail.resolves(mockUser);
            bcryptCompareStub.resolves(true);

            const result = await userService.login('testuser', 'password123');

            assert.deepEqual(result, mockUser);
            assert.equal(userRepoStub.getByLoginOrEmail.callCount, 1);
            assert.equal(bcryptCompareStub.callCount, 1);
        });

        it('should throw an error if user is not found', async () => {
            userRepoStub.getByLoginOrEmail.resolves(null);

            try {
                await userService.login('nonexistent', 'password123');
                assert.fail('Expected an error to be thrown');
            } catch (err) {
                assert.equal((err as Error).message, 'Invalid credentials.');
            }

            assert.equal(userRepoStub.getByLoginOrEmail.callCount, 1);
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

            userRepoStub.getByLoginOrEmail.resolves(mockUser);
            bcryptCompareStub.resolves(false);

            try {
                await userService.login('testuser', 'wrongpassword');
                assert.fail('Expected an error to be thrown');
            } catch (err) {
                assert.equal((err as Error).message, 'Invalid credentials.');
            }

            assert.equal(userRepoStub.getByLoginOrEmail.callCount, 1);
            assert.equal(bcryptCompareStub.callCount, 1);
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

            userRepoStub.getByLoginOrEmail.resolves(null);
            bcryptHashStub.resolves('hashedPassword');
            userRepoStub.insert.resolves({id: 1, ...mockUser});

            await userService.register('newuser', 'new@example.com', 'New', 'User', 'password123');

            assert.equal(userRepoStub.getByLoginOrEmail.callCount, 1);
            assert.equal(bcryptHashStub.callCount, 1);
            assert.equal(userRepoStub.insert.callCount, 1);
            assert(userRepoStub.insert.calledWith(mockUser));
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

            userRepoStub.getByLoginOrEmail.resolves(existingUser);

            try {
                await userService.register('existinguser', 'new@example.com', 'New', 'User', 'password123');
                assert.fail('Expected an error to be thrown');
            } catch (err) {
                assert.match((err as Error).message, /Login is already taken./);
            }

            assert.equal(userRepoStub.getByLoginOrEmail.callCount, 1);
            assert.equal(bcryptHashStub.callCount, 0);
            assert.equal(userRepoStub.insert.callCount, 0);
        });

        it('should throw an error if email is already taken', async () => {
            userRepoStub.getByLoginOrEmail.resolves({ email: 'existing@example.com'} as User);

            try {
                await userService.register('newuser', 'existing@example.com', 'New', 'User', 'password123');
                assert.fail('Expected an error to be thrown');
            } catch (err) {
                //TODO: Instead of multiple messages glued together, throw multiple errors!
                assert.match((err as Error).message, /There is already an account with that email./);
            }

            assert.equal(userRepoStub.getByLoginOrEmail.callCount, 1);
            assert.equal(bcryptHashStub.callCount, 0);
            assert.equal(userRepoStub.insert.callCount, 0);
        });
    });
})