**How To Test Using Protractor in Edji**

_27 Jan 2017_

_Last Modified: 27 Jan 2017_

_Nicholas Pumper_

**Basics**

---

**This guide is dumb, where should I go to learn more?**

Go to the Protractor Github, ya dumb. But this a good guide because it explains Edji specifics on how we do our end-to-end testing.

**How is this organized?**

All end-to-end tests go under ‘src/tests/e2e’. All unit tests go under ‘src/tests/unit-tests’.

**How do I write a test?**

Go to the ‘spec.ts’ file for the page you want to write a test for. For example, ‘home.spec.ts’ runs the tests for the home page.

**What are the .ts files in ‘src/tests/page-objects’ for?**

Page Objects contain all of the variables containing the elements of that page, and general actions for that page. For example, ‘home-page.ts’ contains public variables for the elements and public methods for general actions on the homepage. *There should be no ‘expect’ or ‘browser.wait’ statements in Page Objects. *Import a page object at the beginning of a ‘~spec.ts’ to use it.

**What is up with the PageObjectInterface that’s being implemented?**

Use this so there are certain functions that are on *every *page object. For example, ‘void getPage()’ is a good one to keep in there because we should be able to import a Page Object and get the url of the page that is referring to.

**Basic Actions**

**I want to run all the tests!**

Run ‘yarn run protractor — —suites all’.

**I want to run tests for one particular page?**

Run ‘yarn run protractor — —suites pageNameHere’.

**How do I see what tests I can run?**

Go to ‘/edji-hotrod/config/protractor.conf.js’, then look under ‘suites’ in that file. Each variable is a pathname to ‘spec.ts’ files that that suite uses. Type in the name of the suite after the command ‘yarn run protractor — —suites ‘ to run that suite.
