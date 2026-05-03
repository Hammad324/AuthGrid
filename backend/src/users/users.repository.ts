import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "@prisma/client";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()


export class UsersRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(createUserDto: CreateUserDto) {
        return this.prisma.user.create({
            data: createUserDto
        })
    }

    findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email }
        })
    }

    findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id }
        })
    }

    update(id: string, data: UpdateUserDto) {
        return this.prisma.user.update({
            where: { id },
            data
        })
    }

    softDelete(id: string) {
        return this.prisma.user.update({
            where: { id },
            data: { 
                isDeleted: true,
                deletedAt: new Date(),
             }
        })
    }

    // ----------------- Only for admins ----------------- //

    banUser(id: string) {
        return this.prisma.user.update({
            where: { id },
            data: { isBanned: true } // will have to add an isBanned boolean field to the User model in schema.prisma for this to work.
        })
    }

    unbanUser(id: string) {
        return this.prisma.user.update({
            where: { id },
            data: { isBanned: false } 
        })
    }

    //Soft delete — add deletedAt DateTime? to the User model - done
    
    //Invalidate all sessions — delete all RefreshToken records on soft-delete so the user is immediately logged out everywhere
    //Guard against tenant owners — block deletion if the user is the sole OWNER of any tenant (force ownership transfer first)
    //Grace period — allow re-activation within 30 days, then a cron job permanently purges
}