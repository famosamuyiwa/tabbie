import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { User } from 'interfaces/common';
import { Model } from 'mongoose';

import { Strategy, VerifyCallback } from 'passport-google-oauth2';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(@InjectModel('User') private userModel: Model<User>) {
    super({
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_AUTH_CALLBACK_URL,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const newUser = new this.userModel({
      email: emails[0].value,
      avatar: photos[0].value,
    });

    const user = await newUser.save();
    // const user = {
    //   provider: 'google',
    //   providerId: id,
    //   email: emails[0].value,
    //   name: `${name.givenName} ${name.familyName}`,
    //   picture: photos[0].value,
    // };
  }
}
