import { Module, forwardRef } from '@nestjs/common';
import { AuthSessionService } from './session.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [AuthSessionService],
  exports: [AuthSessionService],
})
export class SessionModule {}
