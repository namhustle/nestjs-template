import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from './schemas'
import { FilterQuery, PaginateModel } from 'mongoose'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: PaginateModel<UserDocument>,
  ) {}

  async create(payload: Omit<User, '_id'>) {
    return this.userModel.create(payload)
  }

  async findOneById(userId: string) {
    return this.userModel.findById(userId)
  }

  async findOne(
    filter: FilterQuery<User>,
    options: {
      select?: string | string[]
    } = {},
  ) {
    return this.userModel.findOne(filter).select(options.select || {})
  }

  async exists(filter: FilterQuery<User>) {
    return this.userModel.exists(filter)
  }
}
