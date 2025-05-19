import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as paginate from 'mongoose-paginate-v2'
import { HydratedDocument } from 'mongoose'
import { UserGender, UserRole } from '../enums'

export type UserDocument = HydratedDocument<User>

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ type: String, required: true })
  fullName: string

  @Prop({ type: String, required: false })
  username?: string

  @Prop({ type: String, required: false, select: false })
  hashedPassword?: string

  @Prop({ type: String, enum: UserGender, required: false })
  gender?: UserGender

  @Prop({
    type: [String],
    enum: UserRole,
    required: false,
    default: [UserRole.USER],
  })
  roles?: UserRole[]
}

export const UserSchema = SchemaFactory.createForClass(User)
UserSchema.plugin(paginate)
