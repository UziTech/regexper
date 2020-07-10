import php from '../../../src/js/parser/php/grammer.js';
import Node from '../../../src/js/parser/node.js';
import { testEach } from '../../helpers.js';

describe('parser/php/subexp.js', function() {

  beforeEach(function() {
    Node.state = { groupCounter: 1 };
  });

  testEach(
    'Subexp',
    {
      '(?>test)': {
        label: 'atomic group',
        state: jasmine.objectContaining({ groupCounter: 1 }),
        regexp: jasmine.objectContaining({ textValue: 'test' }),
      },
    },
    str => {
      const parser = new php.Parser(str);
      return parser.__consume__subexp();
    },
  );

});
