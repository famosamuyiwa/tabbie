export enum ResponseStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum QueryBy {
  EMAIL = 'email',
  USERNAME = 'username',
  BOTH = 'both',
}

export enum QueryAction {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}

export enum OAuthProvider {
  GOOGLE = 'GOOGLE',
}

export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  PENDING = 'PENDING',
}

export enum SplitStatus {
  ACTIVE = 'ACTIVE',
  SETTLED = 'SETTLED',
  ALL = 'ALL',
}

export enum CategoryIcons {
  DEFAULT = 'Default',
  DINNER = 'Dinner',
  SPORT = 'Sport',
  SHOPPING = 'Shopping',
  EVENT = 'Event',
  BIRTHDAY = 'Birthday',
  TRIP = 'Trip',
  FUN = 'Fun',
  UTILITY = 'Utility',
  FITNESS = 'Fitness',
  SUBSCRIPTION = 'Subscription',
}

export enum SplitMemberType {
  CREATOR = 'CREATOR',
  MEMBER = 'MEMBER',
}

export enum NotificationType {
  SPLIT_SETTLED = 'Settled',
  MARKED_AS_PAID = 'MARKED_AS_PAID',
  MARKED_AS_PAID_WITH_RECEIPT = 'MARKED_AS_PAID_WITH_RECEIPT',
}

export enum NotificationContext {
  SPLIT = 'SPLIT',
  FRIEND = 'FRIEND',
}

export enum NotificationRecipient {
  SPLIT_CREATOR = 'SPLIT_CREATOR',
  SPLIT_MEMBER = 'SPLIT_MEMBER',
  SPLIT_ALL_BUT_CREATOR = 'SPLIT_ALL_BUT_CREATOR',
  SPLIT_ALL = 'SPLIT_ALL',
}
