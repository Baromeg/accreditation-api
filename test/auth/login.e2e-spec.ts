import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('AuthController (e2e) - Login', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testUser = {
    email: 'login@test.com',
    password: 'secure123',
    firstName: 'Login',
    lastName: 'User',
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.user.delete({ where: { email: testUser.email } }).catch(() => {});

    // Register test user
    await request(app.getHttpServer()).post('/auth/register').send(testUser).expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should login and return access + refresh tokens', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('refresh_token');
  });

  it('should reject invalid password with 401', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: 'wrong-password',
      })
      .expect(401);

    expect(response.body.message).toBe('Invalid credentials');
  });

  it('should reject non-existing email with 401', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'notfound@example.com',
        password: 'whatever123',
      })
      .expect(401);

    expect(response.body.message).toBe('Invalid credentials');
  });
});
