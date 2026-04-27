import { Hono } from 'hono';
import * as UserService from '../services/user_service';

export const userController = new Hono();

userController.post('/signup', async (c) => await UserService.signUp(c) );