import StateMachine from 'fsm-as-promised';

export default (scene, entity) => {
  var behaviors = StateMachine({
    initial: 'here',
    events: [
      { name: 'wait', from: 'here' },
      { name: 'jump', from: 'here', to: 'there' },
      { name: 'walk', from: ['there', 'somewhere'], to: 'here' }
    ],
    callbacks: {
      onwait: function(options) {
        console.log(options);
        // do something when executing the transition
      },
      onleavehere: function() {
        // do something when leaving state here
      },
      onleave: function() {
        // do something when leaving any state
      },
      onentersomewhere: function() {
        // do something when entering state somewhere
      },
      onenter: function() {
        // do something when entering any state
      },
      onenteredsomewhere: function() {
        // do something after entering state somewhere
        // transition is complete and events can be triggered safely
      },
      onentered: function() {
        // do something after entering any state
        // transition is complete and events can be triggered safely
      }
    }
  });

  return behaviors;
};
