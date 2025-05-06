import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('AuthController (e2e) - Register', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a user and return access + refresh tokens', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'happy@example.com',
        password: 'password123',
        firstName: 'Testy',
        lastName: 'McTestface',
      })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('refresh_token');
    expect(typeof response.body.access_token).toBe('string');
    expect(typeof response.body.refresh_token).toBe('string');

    // Check user in DB
    const user = await prisma.user.findUnique({
      where: { email: 'happy@example.com' },
    });

    expect(user).toBeDefined();
    expect(user?.passwordHash).not.toBe('password123');
    expect(user?.hashedRefreshToken).toBeDefined();

    await prisma.user.delete({ where: { email: 'happy@example.com' } }).catch(() => {});
  });

  it('should not allow duplicate email registration', async () => {
    // First registration should succeed
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'dupe@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
      })
      .expect(201);

    // Second registration with same email should fail
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'dupe@example.com',
        password: 'anotherPass',
        firstName: 'Duped',
        lastName: 'User',
      })
      .expect(409);

    expect(response.body.message).toBe('Email already in use');

    await prisma.user.delete({ where: { email: 'happy@example.com' } }).catch(() => {});
    await prisma.user.delete({ where: { email: 'dupe@example.com' } }).catch(() => {});
  });
});
