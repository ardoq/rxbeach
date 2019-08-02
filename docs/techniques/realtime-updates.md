# Handling realtime updates

Realtime updates can be handled with sagas.

Consider the case when a remote user makes a change:

1. The local instance receives the change with web sockets
2. An saga is invoked with a payload describing the change
3. The saga buffers this action until another action is dispatched telling the
   saga to flush it's changes
4. The saga dispatches the actions for changing the local collection

Some implementation details:

- The websocket architecture defines the `remoteChange` action as a stand-alone
  action
- The saga's corresponding action will be `flushBufferedRemoteChanges`
- The saga needs to know what collection to update, so it can call the
  appropriate CRUD reducers
