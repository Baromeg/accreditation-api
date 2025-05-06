import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('AuthController (e2e) - Refresh', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testUser = {
    email: 'refresh@test.com',
    password: 'refreshpass',
    firstName: 'Ref',
    lastName: 'Token',
  };

  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.user.delete({ where: { email: testUser.email } }).catch(() => {});

    // Register user
    await request(app.getHttpServer()).post('/auth/register').send(testUser).expect(201);

    // Login to get refresh token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(201);

    refreshToken = loginRes.body.refresh_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return new access and refresh tokens when using valid refresh_token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: refreshToken })
      .expect(201);

    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('refresh_token');
  });

  it('should reject invalid refresh token with 403', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: 'invalid-token' })
      .expect(403);
  });
});
