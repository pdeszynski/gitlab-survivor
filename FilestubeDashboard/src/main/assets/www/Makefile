LESS=less
CSS=css

.PHONY: all css clean

all: css

$(CSS)/%.css: $(LESS)/%.less
	lessc $< >$@

css: $(patsubst $(LESS)/%.less,$(CSS)/%.css,$(wildcard $(LESS)/*.less))

clean:
	rm $(CSS)/*.css