# Action dispatching subscribers

This, yet unnamed pattern, deals with pipes on data streams or the action stream
that dispatches actions.

They are not routines, seeing as they are not limited to listening to the action
stream, and they do not really perform side effects. While routines are limited
in their input, but not in output, these are limited in output, but not in
input.
