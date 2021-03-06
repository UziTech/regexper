import javascript from '../../../src/js/parser/javascript/grammar.js';
import Snap from 'snapsvg-cjs';
import { testEach } from '../../helpers.js';

describe('parser/javascript/escape.js', function() {

  testEach(
    'Escape',
    {
      '\\b': { label: 'word boundary', ordinal: -1 },
      '\\B': { label: 'non-word boundary', ordinal: -1 },
      '\\d': { label: 'digit', ordinal: -1 },
      '\\D': { label: 'non-digit', ordinal: -1 },
      '\\f': { label: 'form feed (0x0C)', ordinal: 0x0c },
      '\\n': { label: 'line feed (0x0A)', ordinal: 0x0a },
      '\\r': { label: 'carriage return (0x0D)', ordinal: 0x0d },
      '\\s': { label: 'white space', ordinal: -1 },
      '\\S': { label: 'non-white space', ordinal: -1 },
      '\\t': { label: 'tab (0x09)', ordinal: 0x09 },
      '\\v': { label: 'vertical tab (0x0B)', ordinal: 0x0b },
      '\\w': { label: 'word', ordinal: -1 },
      '\\W': { label: 'non-word', ordinal: -1 },
      '\\0': { label: 'null (0x00)', ordinal: 0 },
      '\\1': { label: 'Back reference (group = 1)', ordinal: -1 },
      '\\2': { label: 'Back reference (group = 2)', ordinal: -1 },
      '\\3': { label: 'Back reference (group = 3)', ordinal: -1 },
      '\\4': { label: 'Back reference (group = 4)', ordinal: -1 },
      '\\5': { label: 'Back reference (group = 5)', ordinal: -1 },
      '\\6': { label: 'Back reference (group = 6)', ordinal: -1 },
      '\\7': { label: 'Back reference (group = 7)', ordinal: -1 },
      '\\8': { label: 'Back reference (group = 8)', ordinal: -1 },
      '\\9': { label: 'Back reference (group = 9)', ordinal: -1 },
      '\\012': { label: 'octal: 12 (0x0A)', ordinal: 10 },
      '\\cx': { label: 'ctrl-X (0x18)', ordinal: 24 },
      '\\xab': { label: '0xAB', ordinal: 0xab },
      '\\uabcd': { label: 'U+ABCD', ordinal: 0xabcd },
    },
    str => {
      const parser = new javascript.Parser(str);
      return parser.__consume__terminal();
    },
  );

  describe('#_render', function() {

    beforeEach(function() {
      const parser = new javascript.Parser('\\b');
      this.node = parser.__consume__terminal();
      this.node.state = {};

      this.svg = Snap(document.createElement('svg'));
      this.node.container = this.svg.group();
      spyOn(this.node, 'renderLabel').and.callThrough();
    });

    it('renders a label', async function() {
      await this.node._render();
      expect(this.node.renderLabel).toHaveBeenCalledWith('word boundary');
    });

    it('sets the edge radius of the rect', async function() {
      const label = await this.node._render();

      expect(label.select('rect').attr()).toEqual(jasmine.objectContaining({
        rx: '3',
        ry: '3',
      }));
    });

  });

});
