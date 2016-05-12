(function() {
  'use strict';

  angular
    .module('testNodeExpress')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
