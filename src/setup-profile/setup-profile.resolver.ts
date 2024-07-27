import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { SetupProfileService } from './setup-profile.service';
import { SetupProfileResponse } from './dtos/setup-profile-response';
import { SetupProfileInput } from './dtos/setup-profile-input';

@Resolver(() => SetupProfileResponse)
export class SetupProfileResolver {
  constructor(private setupProfileService: SetupProfileService) {}

  @Mutation(() => SetupProfileResponse, { name: 'setupProfile' })
  async setupProfile(
    @Args('input') input: SetupProfileInput,
  ): Promise<SetupProfileResponse> {
    const user = await this.setupProfileService.setupProfile(input);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      phoneNumber: user.phoneNumber,
    };
  }
}
