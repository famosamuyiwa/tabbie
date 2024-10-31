// src/utils/validation-log.helper.ts
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ValidationLogEventData } from 'utils/lib/validation-log-event-data';
import { Prisma, ValidationLog } from '@prisma/client';
import { SplitStatus } from 'enum/common';

export class Utils {
  private readonly log = new Logger(Utils.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  createValidationLogEvent(data) {
    const isEmitted = this.eventEmitter.emit(
      'validation-log-tracer-event',
      new ValidationLogEventData(data),
    );
    if (isEmitted) {
      this.log.debug('Successfully created validation log event');
    } else {
      this.log.debug('Failed to create validation log event');
    }
  }
}

export async function handleResponse(response) {
  try {
    console.log(response);

    return {
      status: 'success',
      code: 201,
      data: response,
    };
  } catch (err) {
    console.log(err);

    // Check if the error is a ConflictException
    if (err instanceof HttpException) {
      console.log(`${err}`);
    } else {
      throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export async function getSplitsWhere(
  userId: number,
  status: SplitStatus,
): Promise<Prisma.SplitWhereInput> {
  let where: Prisma.SplitWhereInput;

  switch (status) {
    case SplitStatus.ACTIVE:
      where = {
        OR: [{ creatorId: userId }, { users: { some: { userId: userId } } }],
        status,
        percentage: {
          not: 100,
        },
        expense: {
          userExpenses: {
            some: {
              userId,
              isPaid: false,
            },
          },
        },
      };
      break;
    case SplitStatus.SETTLED:
      where = {
        OR: [
          { status }, // Fully settled splits
          {
            expense: {
              userExpenses: {
                some: {
                  userId: userId,
                  isPaid: true, // Specific user has paid
                },
              },
            },
          },
        ],
      };
      break;
    case SplitStatus.ALL:
    default:
      where = {
        OR: [
          { creatorId: userId },
          { users: { some: { userId: userId } } }, // Check if user is a participant
        ],
      };
  }

  return Promise.resolve(where);
}
