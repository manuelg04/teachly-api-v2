import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SetupProfileInput {
  @Field()
  email: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  photo?: string;

  @Field({ nullable: true })
  phoneNumber?: string;
}
