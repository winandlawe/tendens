(function() {
  module.exports = function(colorPicker) {
    return {
      Emitter: (require('../modules/Emitter'))(),
      element: null,
      control: null,
      canvas: null,
      emitSelectionChanged: function() {
        return this.Emitter.emit('selectionChanged', this.control.selection);
      },
      onSelectionChanged: function(callback) {
        return this.Emitter.on('selectionChanged', callback);
      },
      emitColorChanged: function() {
        return this.Emitter.emit('colorChanged', this.control.selection.color);
      },
      onColorChanged: function(callback) {
        return this.Emitter.on('colorChanged', callback);
      },
      activate: function() {
        var Body;
        Body = colorPicker.getExtension('Body');
        this.element = {
          el: (function() {
            var _classPrefix, _el;
            _classPrefix = Body.element.el.className;
            _el = document.createElement('div');
            _el.classList.add(_classPrefix + "-saturation");
            return _el;
          })(),
          width: 0,
          height: 0,
          getWidth: function() {
            return this.width || this.el.offsetWidth;
          },
          getHeight: function() {
            return this.height || this.el.offsetHeight;
          },
          rect: null,
          getRect: function() {
            return this.rect || this.updateRect();
          },
          updateRect: function() {
            return this.rect = this.el.getClientRects()[0];
          },
          add: function(element) {
            this.el.appendChild(element);
            return this;
          }
        };
        Body.element.add(this.element.el, 0);
        colorPicker.onOpen((function(_this) {
          return function() {
            var _rect;
            if (!(_this.element.updateRect() && (_rect = _this.element.getRect()))) {
              return;
            }
            _this.width = _rect.width;
            return _this.height = _rect.height;
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var Hue, Saturation, _elementHeight, _elementWidth;
            Saturation = _this;
            Hue = colorPicker.getExtension('Hue');
            _elementWidth = _this.element.getWidth();
            _elementHeight = _this.element.getHeight();
            _this.canvas = {
              el: (function() {
                var _el;
                _el = document.createElement('canvas');
                _el.width = _elementWidth;
                _el.height = _elementHeight;
                _el.classList.add(Saturation.element.el.className + "-canvas");
                return _el;
              })(),
              context: null,
              getContext: function() {
                return this.context || (this.context = this.el.getContext('2d'));
              },
              getColorAtPosition: function(x, y) {
                return colorPicker.SmartColor.HSVArray([Hue.getHue(), x / Saturation.element.getWidth() * 100, 100 - (y / Saturation.element.getHeight() * 100)]);
              },
              previousRender: null,
              render: function(smartColor) {
                var _context, _gradient, _hslArray, _joined;
                _hslArray = ((function() {
                  if (!smartColor) {
                    return colorPicker.SmartColor.HEX('#f00');
                  } else {
                    return smartColor;
                  }
                })()).toHSLArray();
                _joined = _hslArray.join(',');
                if (this.previousRender && this.previousRender === _joined) {
                  return;
                }
                _context = this.getContext();
                _context.clearRect(0, 0, _elementWidth, _elementHeight);
                _gradient = _context.createLinearGradient(0, 0, _elementWidth, 1);
                _gradient.addColorStop(.01, 'hsl(0,100%,100%)');
                _gradient.addColorStop(.99, "hsl(" + _hslArray[0] + ",100%,50%)");
                _context.fillStyle = _gradient;
                _context.fillRect(0, 0, _elementWidth, _elementHeight);
                _gradient = _context.createLinearGradient(0, 0, 1, _elementHeight);
                _gradient.addColorStop(.01, 'rgba(0,0,0,0)');
                _gradient.addColorStop(.99, 'rgba(0,0,0,1)');
                _context.fillStyle = _gradient;
                _context.fillRect(0, 0, _elementWidth, _elementHeight);
                return this.previousRender = _joined;
              }
            };
            Hue.onColorChanged(function(smartColor) {
              return _this.canvas.render(smartColor);
            });
            _this.canvas.render();
            return _this.element.add(_this.canvas.el);
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var Hue, Saturation, hasChild;
            hasChild = function(element, child) {
              var _parent;
              if (child && (_parent = child.parentNode)) {
                if (child === element) {
                  return true;
                } else {
                  return hasChild(element, _parent);
                }
              }
              return false;
            };
            Saturation = _this;
            Hue = colorPicker.getExtension('Hue');
            _this.control = {
              el: (function() {
                var _el;
                _el = document.createElement('div');
                _el.classList.add(Saturation.element.el.className + "-control");
                return _el;
              })(),
              isGrabbing: false,
              previousControlPosition: null,
              updateControlPosition: function(x, y) {
                var _joined;
                _joined = x + "," + y;
                if (this.previousControlPosition && this.previousControlPosition === _joined) {
                  return;
                }
                requestAnimationFrame((function(_this) {
                  return function() {
                    _this.el.style.left = x + "px";
                    return _this.el.style.top = y + "px";
                  };
                })(this));
                return this.previousControlPosition = _joined;
              },
              selection: {
                x: null,
                y: 0,
                color: null
              },
              setSelection: function(e, saturation, key) {
                var _height, _position, _rect, _width, _x, _y;
                if (saturation == null) {
                  saturation = null;
                }
                if (key == null) {
                  key = null;
                }
                if (!(Saturation.canvas && (_rect = Saturation.element.getRect()))) {
                  return;
                }
                _width = Saturation.element.getWidth();
                _height = Saturation.element.getHeight();
                if (e) {
                  _x = e.pageX - _rect.left;
                  _y = e.pageY - _rect.top;
                } else if ((typeof saturation === 'number') && (typeof key === 'number')) {
                  _x = _width * saturation;
                  _y = _height * key;
                } else {
                  if (typeof this.selection.x !== 'number') {
                    this.selection.x = _width;
                  }
                  _x = this.selection.x;
                  _y = this.selection.y;
                }
                _x = this.selection.x = Math.max(0, Math.min(_width, Math.round(_x)));
                _y = this.selection.y = Math.max(0, Math.min(_height, Math.round(_y)));
                _position = {
                  x: Math.max(6, Math.min(_width - 7, _x)),
                  y: Math.max(6, Math.min(_height - 7, _y))
                };
                this.selection.color = Saturation.canvas.getColorAtPosition(_x, _y);
                this.updateControlPosition(_position.x, _position.y);
                return Saturation.emitSelectionChanged();
              },
              refreshSelection: function() {
                return this.setSelection();
              }
            };
            _this.control.refreshSelection();
            colorPicker.onInputColor(function(smartColor) {
              var h, ref, s, v;
              ref = smartColor.toHSVArray(), h = ref[0], s = ref[1], v = ref[2];
              return _this.control.setSelection(null, s, 1 - v);
            });
            Saturation.onSelectionChanged(function() {
              return Saturation.emitColorChanged();
            });
            colorPicker.onOpen(function() {
              return _this.control.refreshSelection();
            });
            colorPicker.onOpen(function() {
              return _this.control.isGrabbing = false;
            });
            colorPicker.onClose(function() {
              return _this.control.isGrabbing = false;
            });
            Hue.onColorChanged(function() {
              return _this.control.refreshSelection();
            });
            colorPicker.onMouseDown(function(e, isOnPicker) {
              if (!(isOnPicker && hasChild(Saturation.element.el, e.target))) {
                return;
              }
              e.preventDefault();
              _this.control.isGrabbing = true;
              return _this.control.setSelection(e);
            });
            colorPicker.onMouseMove(function(e) {
              if (!_this.control.isGrabbing) {
                return;
              }
              return _this.control.setSelection(e);
            });
            colorPicker.onMouseUp(function(e) {
              if (!_this.control.isGrabbing) {
                return;
              }
              _this.control.isGrabbing = false;
              return _this.control.setSelection(e);
            });
            return _this.element.add(_this.control.el);
          };
        })(this));
        return this;
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy9ja25qdS8uYXRvbS9wYWNrYWdlcy9jb2xvci1waWNrZXIvbGliL2V4dGVuc2lvbnMvU2F0dXJhdGlvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBS0k7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLFdBQUQ7V0FDYjtNQUFBLE9BQUEsRUFBUyxDQUFDLE9BQUEsQ0FBUSxvQkFBUixDQUFELENBQUEsQ0FBQSxDQUFUO01BRUEsT0FBQSxFQUFTLElBRlQ7TUFHQSxPQUFBLEVBQVMsSUFIVDtNQUlBLE1BQUEsRUFBUSxJQUpSO01BVUEsb0JBQUEsRUFBc0IsU0FBQTtlQUNsQixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxrQkFBZCxFQUFrQyxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQTNDO01BRGtCLENBVnRCO01BWUEsa0JBQUEsRUFBb0IsU0FBQyxRQUFEO2VBQ2hCLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGtCQUFaLEVBQWdDLFFBQWhDO01BRGdCLENBWnBCO01BZ0JBLGdCQUFBLEVBQWtCLFNBQUE7ZUFDZCxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxjQUFkLEVBQThCLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQWpEO01BRGMsQ0FoQmxCO01Ba0JBLGNBQUEsRUFBZ0IsU0FBQyxRQUFEO2VBQ1osSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksY0FBWixFQUE0QixRQUE1QjtNQURZLENBbEJoQjtNQXdCQSxRQUFBLEVBQVUsU0FBQTtBQUNOLFlBQUE7UUFBQSxJQUFBLEdBQU8sV0FBVyxDQUFDLFlBQVosQ0FBeUIsTUFBekI7UUFJUCxJQUFDLENBQUEsT0FBRCxHQUNJO1VBQUEsRUFBQSxFQUFPLENBQUEsU0FBQTtBQUNILGdCQUFBO1lBQUEsWUFBQSxHQUFlLElBQUksQ0FBQyxPQUFPLENBQUMs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LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyAgQ29sb3IgUGlja2VyL2V4dGVuc2lvbnM6IFNhdHVyYXRpb25cbiMgIENvbG9yIFNhdHVyYXRpb24gY29udHJvbGxlclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IChjb2xvclBpY2tlcikgLT5cbiAgICAgICAgRW1pdHRlcjogKHJlcXVpcmUgJy4uL21vZHVsZXMvRW1pdHRlcicpKClcblxuICAgICAgICBlbGVtZW50OiBudWxsXG4gICAgICAgIGNvbnRyb2w6IG51bGxcbiAgICAgICAgY2FudmFzOiBudWxsXG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjICBTZXQgdXAgZXZlbnRzIGFuZCBoYW5kbGluZ1xuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAjIFNlbGVjdGlvbiBDaGFuZ2VkIGV2ZW50XG4gICAgICAgIGVtaXRTZWxlY3Rpb25DaGFuZ2VkOiAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIuZW1pdCAnc2VsZWN0aW9uQ2hhbmdlZCcsIEBjb250cm9sLnNlbGVjdGlvblxuICAgICAgICBvblNlbGVjdGlvbkNoYW5nZWQ6IChjYWxsYmFjaykgLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLm9uICdzZWxlY3Rpb25DaGFuZ2VkJywgY2FsbGJhY2tcblxuICAgICAgICAjIENvbG9yIENoYW5nZWQgZXZlbnRcbiAgICAgICAgZW1pdENvbG9yQ2hhbmdlZDogLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLmVtaXQgJ2NvbG9yQ2hhbmdlZCcsIEBjb250cm9sLnNlbGVjdGlvbi5jb2xvclxuICAgICAgICBvbkNvbG9yQ2hhbmdlZDogKGNhbGxiYWNrKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIub24gJ2NvbG9yQ2hhbmdlZCcsIGNhbGxiYWNrXG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjICBDcmVhdGUgYW5kIGFjdGl2YXRlIFNhdHVyYXRpb24gY29udHJvbGxlclxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBhY3RpdmF0ZTogLT5cbiAgICAgICAgICAgIEJvZHkgPSBjb2xvclBpY2tlci5nZXRFeHRlbnNpb24gJ0JvZHknXG5cbiAgICAgICAgIyAgQ3JlYXRlIGVsZW1lbnRcbiAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIEBlbGVtZW50ID1cbiAgICAgICAgICAgICAgICBlbDogZG8gLT5cbiAgICAgICAgICAgICAgICAgICAgX2NsYXNzUHJlZml4ID0gQm9keS5lbGVtZW50LmVsLmNsYXNzTmFtZVxuICAgICAgICAgICAgICAgICAgICBfZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdkaXYnXG4gICAgICAgICAgICAgICAgICAgIF9lbC5jbGFzc0xpc3QuYWRkIFwiI3sgX2NsYXNzUHJlZml4IH0tc2F0dXJhdGlvblwiXG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9lbFxuICAgICAgICAgICAgICAgICMgVXRpbGl0eSBmdW5jdGlvbnNcbiAgICAgICAgICAgICAgICB3aWR0aDogMFxuICAgICAgICAgICAgICAgIGhlaWdodDogMFxuICAgICAgICAgICAgICAgIGdldFdpZHRoOiAtPiByZXR1cm4gQHdpZHRoIG9yIEBlbC5vZmZzZXRXaWR0aFxuICAgICAgICAgICAgICAgIGdldEhlaWdodDogLT4gcmV0dXJuIEBoZWlnaHQgb3IgQGVsLm9mZnNldEhlaWdodFxuXG4gICAgICAgICAgICAgICAgcmVjdDogbnVsbFxuICAgICAgICAgICAgICAgIGdldFJlY3Q6IC0+IHJldHVybiBAcmVjdCBvciBAdXBkYXRlUmVjdCgpXG4gICAgICAgICAgICAgICAgdXBkYXRlUmVjdDogLT4gQHJlY3QgPSBAZWwuZ2V0Q2xpZW50UmVjdHMoKVswXVxuXG4gICAgICAgICAgICAgICAgIyBBZGQgYSBjaGlsZCBvbiB0aGUgU2F0dXJhdGlvbiBlbGVtZW50XG4gICAgICAgICAgICAgICAgYWRkOiAoZWxlbWVudCkgLT5cbiAgICAgICAgICAgICAgICAgICAgQGVsLmFwcGVuZENoaWxkIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNcbiAgICAgICAgICAgIEJvZHkuZWxlbWVudC5hZGQgQGVsZW1lbnQuZWwsIDBcblxuICAgICAgICAjICBVcGRhdGUgZWxlbWVudCByZWN0IHdoZW4gQ29sb3IgUGlja2VyIG9wZW5zXG4gICAgICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBjb2xvclBpY2tlci5vbk9wZW4gPT5cbiAgICAgICAgICAgICAgICByZXR1cm4gdW5sZXNzIEBlbGVtZW50LnVwZGF0ZVJlY3QoKSBhbmQgX3JlY3QgPSBAZWxlbWVudC5nZXRSZWN0KClcbiAgICAgICAgICAgICAgICBAd2lkdGggPSBfcmVjdC53aWR0aFxuICAgICAgICAgICAgICAgIEBoZWlnaHQgPSBfcmVjdC5oZWlnaHRcblxuICAgICAgICAjICBDcmVhdGUgYW5kIGRyYXcgY2FudmFzXG4gICAgICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBzZXRUaW1lb3V0ID0+ICMgd2FpdCBmb3IgdGhlIERPTVxuICAgICAgICAgICAgICAgIFNhdHVyYXRpb24gPSB0aGlzXG4gICAgICAgICAgICAgICAgSHVlID0gY29sb3JQaWNrZXIuZ2V0RXh0ZW5zaW9uICdIdWUnXG5cbiAgICAgICAgICAgICAgICAjIFByZXBhcmUgc29tZSB2YXJpYWJsZXNcbiAgICAgICAgICAgICAgICBfZWxlbWVudFdpZHRoID0gQGVsZW1lbnQuZ2V0V2lkdGgoKVxuICAgICAgICAgICAgICAgIF9lbGVtZW50SGVpZ2h0ID0gQGVsZW1lbnQuZ2V0SGVpZ2h0KClcblxuICAgICAgICAgICAgICAgICMgQ3JlYXRlIGVsZW1lbnRcbiAgICAgICAgICAgICAgICBAY2FudmFzID1cbiAgICAgICAgICAgICAgICAgICAgZWw6IGRvIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBfZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdjYW52YXMnXG4gICAgICAgICAgICAgICAgICAgICAgICBfZWwud2lkdGggPSBfZWxlbWVudFdpZHRoXG4gICAgICAgICAgICAgICAgICAgICAgICBfZWwuaGVpZ2h0ID0gX2VsZW1lbnRIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIF9lbC5jbGFzc0xpc3QuYWRkIFwiI3sgU2F0dXJhdGlvbi5lbGVtZW50LmVsLmNsYXNzTmFtZSB9LWNhbnZhc1wiXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfZWxcbiAgICAgICAgICAgICAgICAgICAgIyBVdGlsaXR5IGZ1bmN0aW9uc1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBudWxsXG4gICAgICAgICAgICAgICAgICAgIGdldENvbnRleHQ6IC0+IEBjb250ZXh0IG9yIChAY29udGV4dCA9IEBlbC5nZXRDb250ZXh0ICcyZCcpXG5cbiAgICAgICAgICAgICAgICAgICAgZ2V0Q29sb3JBdFBvc2l0aW9uOiAoeCwgeSkgLT4gcmV0dXJuIGNvbG9yUGlja2VyLlNtYXJ0Q29sb3IuSFNWQXJyYXkgW1xuICAgICAgICAgICAgICAgICAgICAgICAgSHVlLmdldEh1ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICB4IC8gU2F0dXJhdGlvbi5lbGVtZW50LmdldFdpZHRoKCkgKiAxMDBcbiAgICAgICAgICAgICAgICAgICAgICAgIDEwMCAtICh5IC8gU2F0dXJhdGlvbi5lbGVtZW50LmdldEhlaWdodCgpICogMTAwKV1cblxuICAgICAgICAgICAgICAgICAgICAjIFJlbmRlciBTYXR1cmF0aW9uIGNhbnZhc1xuICAgICAgICAgICAgICAgICAgICBwcmV2aW91c1JlbmRlcjogbnVsbFxuICAgICAgICAgICAgICAgICAgICByZW5kZXI6IChzbWFydENvbG9yKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgX2hzbEFycmF5ID0gKCBkbyAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVubGVzcyBzbWFydENvbG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2xvclBpY2tlci5TbWFydENvbG9yLkhFWCAnI2YwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHJldHVybiBzbWFydENvbG9yXG4gICAgICAgICAgICAgICAgICAgICAgICApLnRvSFNMQXJyYXkoKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBfam9pbmVkID0gX2hzbEFycmF5LmpvaW4gJywnXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWYgQHByZXZpb3VzUmVuZGVyIGFuZCBAcHJldmlvdXNSZW5kZXIgaXMgX2pvaW5lZFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEdldCBjb250ZXh0IGFuZCBjbGVhciBpdFxuICAgICAgICAgICAgICAgICAgICAgICAgX2NvbnRleHQgPSBAZ2V0Q29udGV4dCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBfY29udGV4dC5jbGVhclJlY3QgMCwgMCwgX2VsZW1lbnRXaWR0aCwgX2VsZW1lbnRIZWlnaHRcblxuICAgICAgICAgICAgICAgICAgICAgICAgIyBEcmF3IGh1ZSBjaGFubmVsIG9uIHRvcFxuICAgICAgICAgICAgICAgICAgICAgICAgX2dyYWRpZW50ID0gX2NvbnRleHQuY3JlYXRlTGluZWFyR3JhZGllbnQgMCwgMCwgX2VsZW1lbnRXaWR0aCwgMVxuICAgICAgICAgICAgICAgICAgICAgICAgX2dyYWRpZW50LmFkZENvbG9yU3RvcCAuMDEsICdoc2woMCwxMDAlLDEwMCUpJ1xuICAgICAgICAgICAgICAgICAgICAgICAgX2dyYWRpZW50LmFkZENvbG9yU3RvcCAuOTksIFwiaHNsKCN7IF9oc2xBcnJheVswXSB9LDEwMCUsNTAlKVwiXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIF9jb250ZXh0LmZpbGxTdHlsZSA9IF9ncmFkaWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgX2NvbnRleHQuZmlsbFJlY3QgMCwgMCwgX2VsZW1lbnRXaWR0aCwgX2VsZW1lbnRIZWlnaHRcblxuICAgICAgICAgICAgICAgICAgICAgICAgIyBEcmF3IHNhdHVyYXRpb24gY2hhbm5lbCBvbiB0aGUgYm90dG9tXG4gICAgICAgICAgICAgICAgICAgICAgICBfZ3JhZGllbnQgPSBfY29udGV4dC5jcmVhdGVMaW5lYXJHcmFkaWVudCAwLCAwLCAxLCBfZWxlbWVudEhlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgX2dyYWRpZW50LmFkZENvbG9yU3RvcCAuMDEsICdyZ2JhKDAsMCwwLDApJ1xuICAgICAgICAgICAgICAgICAgICAgICAgX2dyYWRpZW50LmFkZENvbG9yU3RvcCAuOTksICdyZ2JhKDAsMCwwLDEpJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBfY29udGV4dC5maWxsU3R5bGUgPSBfZ3JhZGllbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIF9jb250ZXh0LmZpbGxSZWN0IDAsIDAsIF9lbGVtZW50V2lkdGgsIF9lbGVtZW50SGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gQHByZXZpb3VzUmVuZGVyID0gX2pvaW5lZFxuXG4gICAgICAgICAgICAgICAgIyBSZW5kZXIgYWdhaW4gb24gSHVlIHNlbGVjdGlvbiBjaGFuZ2VcbiAgICAgICAgICAgICAgICBIdWUub25Db2xvckNoYW5nZWQgKHNtYXJ0Q29sb3IpID0+XG4gICAgICAgICAgICAgICAgICAgIEBjYW52YXMucmVuZGVyIHNtYXJ0Q29sb3JcbiAgICAgICAgICAgICAgICBAY2FudmFzLnJlbmRlcigpXG5cbiAgICAgICAgICAgICAgICAjIEFkZCB0byBTYXR1cmF0aW9uIGVsZW1lbnRcbiAgICAgICAgICAgICAgICBAZWxlbWVudC5hZGQgQGNhbnZhcy5lbFxuXG4gICAgICAgICMgIENyZWF0ZSBTYXR1cmF0aW9uIGNvbnRyb2wgZWxlbWVudFxuICAgICAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgc2V0VGltZW91dCA9PiAjIHdhaXQgZm9yIHRoZSBET01cbiAgICAgICAgICAgICAgICBoYXNDaGlsZCA9IChlbGVtZW50LCBjaGlsZCkgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgY2hpbGQgYW5kIF9wYXJlbnQgPSBjaGlsZC5wYXJlbnROb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBjaGlsZCBpcyBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgcmV0dXJuIGhhc0NoaWxkIGVsZW1lbnQsIF9wYXJlbnRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgICAgICAgICAjIENyZWF0ZSBlbGVtZW50XG4gICAgICAgICAgICAgICAgU2F0dXJhdGlvbiA9IHRoaXNcbiAgICAgICAgICAgICAgICBIdWUgPSBjb2xvclBpY2tlci5nZXRFeHRlbnNpb24gJ0h1ZSdcblxuICAgICAgICAgICAgICAgIEBjb250cm9sID1cbiAgICAgICAgICAgICAgICAgICAgZWw6IGRvIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBfZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdkaXYnXG4gICAgICAgICAgICAgICAgICAgICAgICBfZWwuY2xhc3NMaXN0LmFkZCBcIiN7IFNhdHVyYXRpb24uZWxlbWVudC5lbC5jbGFzc05hbWUgfS1jb250cm9sXCJcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9lbFxuICAgICAgICAgICAgICAgICAgICBpc0dyYWJiaW5nOiBub1xuXG4gICAgICAgICAgICAgICAgICAgIHByZXZpb3VzQ29udHJvbFBvc2l0aW9uOiBudWxsXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZUNvbnRyb2xQb3NpdGlvbjogKHgsIHkpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBfam9pbmVkID0gXCIjeyB4IH0sI3sgeSB9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpZiBAcHJldmlvdXNDb250cm9sUG9zaXRpb24gYW5kIEBwcmV2aW91c0NvbnRyb2xQb3NpdGlvbiBpcyBfam9pbmVkXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBlbC5zdHlsZS5sZWZ0ID0gXCIjeyB4IH1weFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGVsLnN0eWxlLnRvcCA9IFwiI3sgeSB9cHhcIlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEBwcmV2aW91c0NvbnRyb2xQb3NpdGlvbiA9IF9qb2luZWRcblxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb246XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogbnVsbFxuICAgICAgICAgICAgICAgICAgICBzZXRTZWxlY3Rpb246IChlLCBzYXR1cmF0aW9uPW51bGwsIGtleT1udWxsKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBTYXR1cmF0aW9uLmNhbnZhcyBhbmQgX3JlY3QgPSBTYXR1cmF0aW9uLmVsZW1lbnQuZ2V0UmVjdCgpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIF93aWR0aCA9IFNhdHVyYXRpb24uZWxlbWVudC5nZXRXaWR0aCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBfaGVpZ2h0ID0gU2F0dXJhdGlvbi5lbGVtZW50LmdldEhlaWdodCgpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfeCA9IGUucGFnZVggLSBfcmVjdC5sZWZ0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3kgPSBlLnBhZ2VZIC0gX3JlY3QudG9wXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFNldCBzYXR1cmF0aW9uIGFuZCBrZXkgZGlyZWN0bHlcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBzYXR1cmF0aW9uIGlzICdudW1iZXInKSBhbmQgKHR5cGVvZiBrZXkgaXMgJ251bWJlcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3ggPSBfd2lkdGggKiBzYXR1cmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3kgPSBfaGVpZ2h0ICoga2V5XG4gICAgICAgICAgICAgICAgICAgICAgICAjIERlZmF1bHQgdG8gcHJldmlvdXMgdmFsdWVzXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBAc2VsZWN0aW9uLnggaXNudCAnbnVtYmVyJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQHNlbGVjdGlvbi54ID0gX3dpZHRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3ggPSBAc2VsZWN0aW9uLnhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfeSA9IEBzZWxlY3Rpb24ueVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBfeCA9IEBzZWxlY3Rpb24ueCA9IE1hdGgubWF4IDAsIChNYXRoLm1pbiBfd2lkdGgsIE1hdGgucm91bmQgX3gpXG4gICAgICAgICAgICAgICAgICAgICAgICBfeSA9IEBzZWxlY3Rpb24ueSA9IE1hdGgubWF4IDAsIChNYXRoLm1pbiBfaGVpZ2h0LCBNYXRoLnJvdW5kIF95KVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBfcG9zaXRpb24gPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IE1hdGgubWF4IDYsIChNYXRoLm1pbiAoX3dpZHRoIC0gNyksIF94KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IE1hdGgubWF4IDYsIChNYXRoLm1pbiAoX2hlaWdodCAtIDcpLCBfeSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgQHNlbGVjdGlvbi5jb2xvciA9IFNhdHVyYXRpb24uY2FudmFzLmdldENvbG9yQXRQb3NpdGlvbiBfeCwgX3lcbiAgICAgICAgICAgICAgICAgICAgICAgIEB1cGRhdGVDb250cm9sUG9zaXRpb24gX3Bvc2l0aW9uLngsIF9wb3NpdGlvbi55XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gU2F0dXJhdGlvbi5lbWl0U2VsZWN0aW9uQ2hhbmdlZCgpXG5cbiAgICAgICAgICAgICAgICAgICAgcmVmcmVzaFNlbGVjdGlvbjogLT4gQHNldFNlbGVjdGlvbigpXG4gICAgICAgICAgICAgICAgQGNvbnRyb2wucmVmcmVzaFNlbGVjdGlvbigpXG5cbiAgICAgICAgICAgICAgICAjIElmIHRoZSBDb2xvciBQaWNrZXIgaXMgZmVkIGEgY29sb3IsIHNldCBpdFxuICAgICAgICAgICAgICAgIGNvbG9yUGlja2VyLm9uSW5wdXRDb2xvciAoc21hcnRDb2xvcikgPT5cbiAgICAgICAgICAgICAgICAgICAgW2gsIHMsIHZdID0gc21hcnRDb2xvci50b0hTVkFycmF5KClcbiAgICAgICAgICAgICAgICAgICAgQGNvbnRyb2wuc2V0U2VsZWN0aW9uIG51bGwsIHMsICgxIC0gdilcblxuICAgICAgICAgICAgICAgICMgV2hlbiB0aGUgc2VsZWN0aW9uIGNoYW5nZXMsIHRoZSBjb2xvciBoYXMgY2hhbmdlZFxuICAgICAgICAgICAgICAgIFNhdHVyYXRpb24ub25TZWxlY3Rpb25DaGFuZ2VkIC0+IFNhdHVyYXRpb24uZW1pdENvbG9yQ2hhbmdlZCgpXG5cbiAgICAgICAgICAgICAgICAjIFJlc2V0XG4gICAgICAgICAgICAgICAgY29sb3JQaWNrZXIub25PcGVuID0+IEBjb250cm9sLnJlZnJlc2hTZWxlY3Rpb24oKVxuICAgICAgICAgICAgICAgIGNvbG9yUGlja2VyLm9uT3BlbiA9PiBAY29udHJvbC5pc0dyYWJiaW5nID0gbm9cbiAgICAgICAgICAgICAgICBjb2xvclBpY2tlci5vbkNsb3NlID0+IEBjb250cm9sLmlzR3JhYmJpbmcgPSBub1xuXG4gICAgICAgICAgICAgICAgIyBCaW5kIGNvbnRyb2xsZXIgZXZlbnRzXG4gICAgICAgICAgICAgICAgSHVlLm9uQ29sb3JDaGFuZ2VkID0+IEBjb250cm9sLnJlZnJlc2hTZWxlY3Rpb24oKVxuXG4gICAgICAgICAgICAgICAgY29sb3JQaWNrZXIub25Nb3VzZURvd24gKGUsIGlzT25QaWNrZXIpID0+XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmxlc3MgaXNPblBpY2tlciBhbmQgaGFzQ2hpbGQgU2F0dXJhdGlvbi5lbGVtZW50LmVsLCBlLnRhcmdldFxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgICAgICAgICAgQGNvbnRyb2wuaXNHcmFiYmluZyA9IHllc1xuICAgICAgICAgICAgICAgICAgICBAY29udHJvbC5zZXRTZWxlY3Rpb24gZVxuXG4gICAgICAgICAgICAgICAgY29sb3JQaWNrZXIub25Nb3VzZU1vdmUgKGUpID0+XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmxlc3MgQGNvbnRyb2wuaXNHcmFiYmluZ1xuICAgICAgICAgICAgICAgICAgICBAY29udHJvbC5zZXRTZWxlY3Rpb24gZVxuXG4gICAgICAgICAgICAgICAgY29sb3JQaWNrZXIub25Nb3VzZVVwIChlKSA9PlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5sZXNzIEBjb250cm9sLmlzR3JhYmJpbmdcbiAgICAgICAgICAgICAgICAgICAgQGNvbnRyb2wuaXNHcmFiYmluZyA9IG5vXG4gICAgICAgICAgICAgICAgICAgIEBjb250cm9sLnNldFNlbGVjdGlvbiBlXG5cbiAgICAgICAgICAgICAgICAjIEFkZCB0byBTYXR1cmF0aW9uIGVsZW1lbnRcbiAgICAgICAgICAgICAgICBAZWxlbWVudC5hZGQgQGNvbnRyb2wuZWxcbiAgICAgICAgICAgIHJldHVybiB0aGlzXG4iXX0=
