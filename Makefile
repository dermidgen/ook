all: clean build

build: buildjs

clean: cleanjs
		
buildjs:
		java -jar /opt/closure/bin/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --warning_level VERBOSE --js ./src/ook.js --js_output_file ./ook/ook-min.js
		cp ./src/ook.js ./ook/ook.js
cleanjs:
		rm -rf ./ook/*


