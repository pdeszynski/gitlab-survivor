SHELL=/bin/bash

ROOT := $(shell pwd)

BOWER=bower

BOOTSTRAP_PATH=libs/bootstrap
BOOTSTRAP_DESTINATION=assets/www/css/lib/

#COLORS
ESC    := \\033
GREEN  := ${ESC}[0;32m
WHITE  := ${ESC}[00m
YELLOW := ${ESC}[1;33m
RED	   := ${ESC}[0;31m

bower = \
	@echo -e "${GREEN}Running bower install libraries${WHITE}"; \
	$(BOWER) install;

bootstrap = \
	@echo -e "${GREEN}Installing bootstrap${WHITE}"; \
	cd ${BOOTSTRAP_PATH}; \
	npm install; \
	make; \
	make clean; \
	make bootstrap; \
	cp -rf bootstrap ${ROOT}/${BOOTSTRAP_DESTINATION}

all: help

help:
	@echo -e "******************************************************\n"; \
	echo -e "${GREEN}Usage:${WHITE}\n"; \
	echo -e "${YELLOW}init:${WHITE}\n Initializes application environment"; \
	echo -e "${YELLOW}css:${WHITE}\n Generate CSS"; \
	echo -e "${YELLOW}css-watch:${WHITE}\n Runs task which observers changes to less files and compiles them"; \
	echo -e "${YELLOW}bower:${WHITE}\n Update bower js files"; \
	echo -e "${YELLOW}packages:${WHITE}\n Installs required ubuntu packages for other tasks"; \
	echo -e "${YELLOW}node-packages:${WHITE}\n Installs required nodejs packages"; \
	echo -e "${YELLOW}bootstrap:${WHITE}\n Rebuilds bootstrap with latest submodule commited version"; \
	echo -e "${YELLOW}weinre:${WHITE}\n Run Weinre debugger server"

css:
	echo -e "${GREEN}Runnig less compiler${WHITE}"
	grunt less

css-watch:
	echo -e "${GREEN}Runnig grunt css watch task${WHITE}"
	grunt watch

bower:
	$(call bower)

packages:
	@sudo add-apt-repository ppa:chris-lea/node.js
	sudo apt-get update
	sudo apt-get install nodejs

node-packages:
	npm install

#Inner task used for updating submodules
submodule-update:
	echo -e "${GREEN}Updating git submodules${WHITE}"
	git submodule init
	git submodule update

bootstrap: submodule-update
	$(call bootstrap)

init: packages submodule-update node-packages css bootstrap
	$(call bower)

weinre:
	weinre --boundHost -all- --debug -true

.PHONY: all css clean-css bower init css css-watch
