import { Controller, UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AllExceptionsFilter } from 'src/lib/rpc-exeptionFilter';
import { IUserById, IUserUpdateDto } from './interfaces/users.contr.interface';
import { ResData } from 'src/lib/resData';
import { USER_SERVICE } from 'src/common/consts/consts';
import { UserEntity } from './entities/user.entity';
import { UserPhoneAlreadyExist } from './exceptions/user.exceptions';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseFilters(new AllExceptionsFilter())
  @GrpcMethod(USER_SERVICE, 'FindOneById')
  async findOne(data: IUserById) {
    const userById = await this.usersService.findOne(data.id);
    return new ResData('user was founded successfully', 200, userById);
  }

  @UseFilters(new AllExceptionsFilter())
  @GrpcMethod(USER_SERVICE, 'FindAll')
  async findAll(data: {}) {
    const allAvailableUsers = await this.usersService.findAll();
    const repeated: { users: UserEntity[] } = { users: allAvailableUsers };
    const resData = new ResData<{ users: Array<UserEntity> }>(
      'users was founded successfully',
      200,
      repeated,
    );
    return resData;
  }

  @UseFilters(new AllExceptionsFilter())
  @GrpcMethod(USER_SERVICE, 'Create')
  async create(data: CreateUserDto) {
    const foundUserByPhone = await this.usersService.findByPhone(data.phone);
    if (foundUserByPhone) {
      throw new UserPhoneAlreadyExist();
    }
    const created = await this.usersService.create(data);
    return new ResData('user was created successfully', 201, created);
  }
  @UseFilters(new AllExceptionsFilter())
  @GrpcMethod(USER_SERVICE, 'Update')
  async update(data: IUserUpdateDto) {
    const foundUserByPhone = await this.usersService.findByPhone(
      data.data.phone,
    );
    if (foundUserByPhone) {
      throw new UserPhoneAlreadyExist();
    }
    const updated = await this.usersService.update(data.id, data.data);
    return new ResData('user was updated successfully', 200, updated);
  }
  @UseFilters(new AllExceptionsFilter())
  @GrpcMethod(USER_SERVICE, 'Delete')
  async delete(data: IUserById) {
    const foundUser = await this.usersService.findOne(data.id);
    const deleted = await this.usersService.remove(foundUser);
    return new ResData('user was deleted successfully', 200, deleted);
  }
}
