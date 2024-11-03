// src/utils/validation-log.helper.ts
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ValidationLogEventData } from 'utils/lib/validation-log-event-data';
import { Prisma } from '@prisma/client';
import { NotificationRecipient, SplitStatus } from 'enum/common';

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

export function getTargetClientIds(
  recipient: NotificationRecipient,
  clients: Map<number, string>,
  splitMembers?: number[],
  splitCreatorId?: number,
): string[] {
  switch (recipient) {
    case NotificationRecipient.SPLIT_CREATOR:
      return splitCreatorId ? getCreatorClientId(clients, splitCreatorId) : [];

    case NotificationRecipient.SPLIT_MEMBER:
      return splitMembers
        ? getMemberClientIds(clients, splitMembers, splitCreatorId)
        : [];

    case NotificationRecipient.SPLIT_ALL_BUT_CREATOR:
      return splitMembers
        ? getAllButCreatorClientIds(clients, splitMembers, splitCreatorId)
        : [];

    case NotificationRecipient.SPLIT_ALL:
      return splitMembers ? getAllClientIds(clients, splitMembers) : [];

    default:
      console.log('Unknown recipient type or no specific recipients required');
  }
}

function getCreatorClientId(
  clients: Map<number, string>,
  splitCreatorId: number,
): string[] {
  const creatorClientId = clients.get(splitCreatorId);
  return creatorClientId ? [creatorClientId] : [];
}

function getMemberClientIds(
  clients: Map<number, string>,
  splitMembers: number[],
  splitCreatorId?: number,
): string[] {
  return splitMembers
    .filter((userId) => userId !== splitCreatorId)
    .map((userId) => clients.get(userId))
    .filter((clientId) => clientId);
}

function getAllButCreatorClientIds(
  clients: Map<number, string>,
  splitMembers: number[],
  splitCreatorId?: number,
): string[] {
  return splitMembers
    .filter((userId) => userId !== splitCreatorId)
    .map((userId) => clients.get(userId))
    .filter((clientId) => clientId);
}

function getAllClientIds(
  clients: Map<number, string>,
  splitMembers: number[],
): string[] {
  return splitMembers
    .map((userId) => clients.get(userId))
    .filter((clientId) => clientId);
}
