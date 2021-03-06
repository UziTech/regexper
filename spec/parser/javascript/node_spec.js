import Node from '../../../src/js/parser/node.js';
import Snap from 'snapsvg-cjs';

describe('parser/javascript/node.js', function() {

  beforeEach(function() {
    Node.state = {};
    this.node = new Node();
  });

  it('references the state from Node.state', function() {
    Node.state.example = 'example state';
    expect(this.node.state.example).toEqual('example state');
  });

  describe('module setter', function() {

    it('extends the node with the module', function() {
      this.node.module = { example: 'value' };
      expect(this.node.example).toEqual('value');
    });

    it('calls the module #setup method', function() {
      const setup = jasmine.createSpy('setup');
      this.node.module = { setup };
      expect(setup).toHaveBeenCalled();
    });

    it('sets up any defined properties and removes \'definedProperties\' field', function() {
      this.node.module = {
        definedProperties: {
          example: {
            get: function() {
              return 'value';
            },
          },
        },
      };
      expect(this.node.example).toEqual('value');
      expect(this.node.definedProperties).toBeUndefined();
    });

  });

  describe('container setter', function() {

    it('adds a class to the container element', function() {
      const container = jasmine.createSpyObj('container', ['addClass']);
      this.node.type = 'example type';
      this.node.container = container;
      expect(container.addClass).toHaveBeenCalledWith('example type');
    });

  });

  describe('anchor getter', function() {

    describe('when a proxy node is used', function() {

      it('returns the anchor from the proxy', function() {
        this.node.proxy = { anchor: 'example anchor' };
        expect(this.node.anchor).toEqual('example anchor');
      });

    });

    describe('when a proxy node is not used', function() {

      it('returns _anchor of the node', function() {
        this.node._anchor = { example: 'value' };
        expect(this.node.anchor).toEqual({
          example: 'value',
        });
      });

    });

  });

  describe('#getBBox', function() {

    it('returns the normalized bbox of the container merged with the anchor', function() {
      this.node.proxy = {
        anchor: {
          anchor: 'example anchor',
        },
      };
      this.node.container = jasmine.createSpyObj('container', ['addClass', 'getBBox']);
      this.node.container.getBBox.and.returnValue({
        bbox: 'example bbox',
        x: 'left',
        x2: 'right',
        cy: 'center',
      });
      expect(this.node.getBBox()).toEqual({
        bbox: 'example bbox',
        anchor: 'example anchor',
        x: 'left',
        x2: 'right',
        cy: 'center',
        ax: 'left',
        ax2: 'right',
        ay: 'center',
      });
    });

  });

  describe('#transform', function() {

    it('returns the result of calling transform on the container', function() {
      this.node.container = jasmine.createSpyObj('container', ['addClass', 'transform']);
      this.node.container.transform.and.returnValue('transform result');
      expect(this.node.transform('matrix')).toEqual('transform result');
      expect(this.node.container.transform).toHaveBeenCalledWith('matrix');
    });

  });

  describe('#deferredStep', function() {

    it('resolves the returned promise when the render is not canceled', async function() {
      try {
        const result = await this.node.deferredStep('result');
        expect(result).toBe('result');
      } catch (err) {
        fail(err);
      }
    });

    it('rejects the returned promise when the render is canceled', async function() {
      try {
        this.node.state.cancelRender = true;
        await this.node.deferredStep('result', 'value');
        fail("Should throw error");
      } catch (err) {
        expect(err).toBe('Render cancelled');
      }
    });

  });

  describe('#renderLabel', function() {

    beforeEach(function() {
      this.group = jasmine.createSpyObj('group', ['addClass', 'rect', 'text']);
      this.group.addClass.and.returnValue(this.group);

      this.node.container = jasmine.createSpyObj('container', ['addClass', 'group']);
      this.node.container.group.and.returnValue(this.group);

      this.text = jasmine.createSpyObj('text', ['getBBox', 'transform']);
      this.rect = jasmine.createSpyObj('rect', ['attr']);

      this.text.getBBox.and.returnValue({
        width: 42,
        height: 24,
      });

      this.group.text.and.returnValue(this.text);
      this.group.rect.and.returnValue(this.rect);
    });

    it('adds a "label" class to the group', async function() {
      await this.node.renderLabel('example label');
      expect(this.group.addClass).toHaveBeenCalledWith('label');
    });

    it('creates a rect element', async function() {
      await this.node.renderLabel('example label');
      expect(this.group.rect).toHaveBeenCalled();
    });

    it('creates a text element', async function() {
      await this.node.renderLabel('example label');
      expect(this.group.text).toHaveBeenCalledWith(0, 0, ['example label']);
    });

    describe('positioning of label elements', function() {

      beforeEach(function() {
        this.text = jasmine.createSpyObj('text', ['getBBox', 'transform']);
        this.rect = jasmine.createSpyObj('rect', ['attr']);

        this.text.getBBox.and.returnValue({
          width: 42,
          height: 24,
        });

        this.group.text.and.returnValue(this.text);
        this.group.rect.and.returnValue(this.rect);
      });

      it('transforms the text element', async function() {
        await this.node.renderLabel('example label');

        expect(this.text.transform).toHaveBeenCalledWith(Snap.matrix()
          .translate(5, 22));
      });

      it('sets the dimensions of the rect element', async function() {
        await this.node.renderLabel('example label');

        expect(this.rect.attr).toHaveBeenCalledWith({
          width: 52,
          height: 34,
        });
      });

      it('resolves with the group element', async function() {
        const group = await this.node.renderLabel('example label');

        expect(group).toEqual(this.group);
      });

    });

  });

  describe('#render', function() {

    beforeEach(function() {
      this.container = jasmine.createSpyObj('container', ['addClass']);
    });

    describe('when a proxy node is used', function() {

      beforeEach(function() {
        this.node.proxy = jasmine.createSpyObj('proxy', ['render']);
        this.node.proxy.render.and.returnValue(Promise.resolve('example proxy result'));
      });

      it('sets the container', async function() {
        await this.node.render(this.container);
        expect(this.node.container).toEqual(this.container);
      });

      it('calls the proxy render method', async function() {
        await expectAsync(this.node.render(this.container)).toBeResolvedTo('example proxy result');
        expect(this.node.proxy.render).toHaveBeenCalledWith(this.container);
      });

    });

    describe('when a proxy node is not used', function() {

      beforeEach(function() {
        this.deferred = this.testablePromise();
        this.node._render = jasmine.createSpy('_render').and.returnValue(this.deferred.promise);
      });

      it('sets the container', async function() {
        this.deferred.resolve();
        await this.node.render(this.container);
        expect(this.node.container).toEqual(this.container);
      });

      it('increments the renderCounter', async function() {
        this.node.state.renderCounter = 0;
        const renderPromise = this.node.render(this.container);
        expect(this.node.state.renderCounter).toEqual(1);
        this.deferred.resolve();
        await renderPromise;
      });

      it('calls #_render', async function() {
        this.deferred.resolve();
        await this.node.render(this.container);
        expect(this.node._render).toHaveBeenCalled();
      });

      describe('when #_render is complete', function() {

        it('decrements the renderCounter', async function() {
          const renderPromise = this.node.render(this.container);

          this.node.state.renderCounter = 42;
          this.deferred.resolve();

          await renderPromise;

          expect(this.node.state.renderCounter).toEqual(41);
        });

        it('ultimately resolves with the node instance', async function() {
          this.deferred.resolve();
          const result = await this.node.render(this.container);

          expect(result).toEqual(this.node);
        });

      });

    });

  });

  describe('#renderLabeledBox', function() {

    beforeEach(function() {
      const svg = Snap(document.createElement('svg'));

      this.text = svg.text();
      this.rect = svg.rect();
      this.content = svg.rect();

      this.node.container = jasmine.createSpyObj('container', ['addClass', 'text', 'rect', 'prepend']);
      this.node.container.text.and.returnValue(this.text);
      this.node.container.rect.and.returnValue(this.rect);

      this.node.type = 'example-type';
    });

    it('creates a text element', async function() {
      await this.node.renderLabeledBox('example label', this.content, { padding: 5 });
      expect(this.node.container.text).toHaveBeenCalledWith(0, 0, ['example label']);
    });

    it('sets the class on the text element', async function() {
      spyOn(this.text, 'addClass').and.callThrough();
      await this.node.renderLabeledBox('example label', this.content, { padding: 5 });
      expect(this.text.addClass).toHaveBeenCalledWith('example-type-label');
    });

    it('creates a rect element', async function() {
      await this.node.renderLabeledBox('example label', this.content, { padding: 5 });
      expect(this.node.container.rect).toHaveBeenCalled();
    });

    it('sets the class on the rect element', async function() {
      spyOn(this.rect, 'addClass').and.callThrough();
      await this.node.renderLabeledBox('example label', this.content, { padding: 5 });
      expect(this.rect.addClass).toHaveBeenCalledWith('example-type-box');
    });

    it('sets the corner radius on the rect element', async function() {
      spyOn(this.rect, 'attr').and.callThrough();
      await this.node.renderLabeledBox('example label', this.content, { padding: 5 });
      expect(this.rect.attr).toHaveBeenCalledWith({
        rx: 3,
        ry: 3,
      });
    });

    describe('positioning of elements', function() {

      beforeEach(function() {
        spyOn(this.text, 'getBBox').and.returnValue({
          width: 100,
          height: 20,
        });
        spyOn(this.content, 'getBBox').and.returnValue({
          width: 200,
          height: 100,
          cx: 100,
        });
      });

      it('positions the text element', async function() {
        spyOn(this.text, 'transform').and.callThrough();
        await this.node.renderLabeledBox('example label', this.content, { padding: 5 });

        expect(this.text.transform).toHaveBeenCalledWith(Snap.matrix()
          .translate(0, 20));
      });

      it('positions the rect element', async function() {
        spyOn(this.rect, 'transform').and.callThrough();
        await this.node.renderLabeledBox('example label', this.content, { padding: 5 });

        expect(this.rect.transform).toHaveBeenCalledWith(Snap.matrix()
          .translate(0, 20));
      });

      it('sets the dimensions of the rect element', async function() {
        spyOn(this.rect, 'attr').and.callThrough();
        await this.node.renderLabeledBox('example label', this.content, { padding: 5 });

        expect(this.rect.attr).toHaveBeenCalledWith({
          width: 210,
          height: 110,
        });
      });

      it('sets the dimensions of the rect element (based on the text element)', async function() {
        this.content.getBBox.and.returnValue({
          width: 50,
          height: 100,
          cx: 25,
        });
        spyOn(this.rect, 'attr').and.callThrough();
        await this.node.renderLabeledBox('example label', this.content, { padding: 5 });

        expect(this.rect.attr).toHaveBeenCalledWith({
          width: 100,
          height: 110,
        });
      });

      it('positions the content element', async function() {
        spyOn(this.content, 'transform').and.callThrough();
        await this.node.renderLabeledBox('example label', this.content, { padding: 5 });

        expect(this.content.transform).toHaveBeenCalledWith(Snap.matrix()
          .translate(5, 25));
      });

    });

  });

});
