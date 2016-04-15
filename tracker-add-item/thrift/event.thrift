include "content.thrift"

/** The event type describe the resource state */
enum EventType {
  Update = 1,
  Delete = 2
}

struct Event {

  1: required EventType eventType;

  2: required i64 eventCreationTime;

  3: required string contentId;

  4: required i64 pageId;

  5: optional content.Content content;

}
