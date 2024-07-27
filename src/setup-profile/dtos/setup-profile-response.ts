import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SetupProfileResponse {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  phoneNumber?: string;
}
