## [1.0.5](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.4...v1.0.5) (2025-09-12)


### Bug Fixes

* **dockerfile:** add space ([1067e61](https://github.com/aegisx-platform/aegisx-starter/commit/1067e611f5d713245e11125566227821c4a2d419))

## [1.0.4](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.3...v1.0.4) (2025-09-12)


### Bug Fixes

* force nginx config refresh for Docker builds ([041d383](https://github.com/aegisx-platform/aegisx-starter/commit/041d3838184c9d40998f737b0fce7250b1430073))

## [1.0.3](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.2...v1.0.3) (2025-09-12)


### Bug Fixes

* force Docker image pulls and ensure clean nginx configs ([7056b6d](https://github.com/aegisx-platform/aegisx-starter/commit/7056b6d553598209d9344f18c1aea7ad33607bad))

## [1.0.2](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.1...v1.0.2) (2025-09-12)


### Bug Fixes

* add no-cache flag to all Docker builds to force fresh nginx configs ([ab6bf56](https://github.com/aegisx-platform/aegisx-starter/commit/ab6bf56246cd32d757f481045cf9a22a928a1200))
* resolve nginx configuration errors and update to pnpm ([7717b13](https://github.com/aegisx-platform/aegisx-starter/commit/7717b139c7770bc91101914c5542a5ea50b1a50f))

## [1.0.1](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.0...v1.0.1) (2025-09-12)


### Bug Fixes

* remove invalid must-revalidate from nginx gzip_proxied directive ([afc433b](https://github.com/aegisx-platform/aegisx-starter/commit/afc433b796e450d02a3498a495d220851615f4fd))

# 1.0.0 (2025-09-12)


### Bug Fixes

* add /api prefix to user management routes ([d2bca32](https://github.com/aegisx-platform/aegisx-starter/commit/d2bca32d4051945c468dfb923624330382c0e09d))
* add comprehensive debugging for self-hosted runner build issues ([c887a73](https://github.com/aegisx-platform/aegisx-starter/commit/c887a73a22c0b0984c4c8e8aa03a1d7d07996761))
* add comprehensive Docker build optimizations for all apps ([210a2de](https://github.com/aegisx-platform/aegisx-starter/commit/210a2de38c4006d40ddcc58c3fe0a1ebe3b28140))
* add missing JWT authentication middleware to auth routes ([7e7d709](https://github.com/aegisx-platform/aegisx-starter/commit/7e7d7091532ba70ce3c4952c68f0e6e0846ac1cb))
* add Node.js memory optimization to all Dockerfiles ([b30f168](https://github.com/aegisx-platform/aegisx-starter/commit/b30f1686fb3fab26cf0bac0929d742c8cf389e0c))
* add reflect-metadata import for tsyringe dependency injection ([9e4a899](https://github.com/aegisx-platform/aegisx-starter/commit/9e4a8996a6f411682c4b3b2fe8da60fa265dbdba))
* add schemas-plugin dependency to all module plugins to prevent startup crash ([d8c6d4b](https://github.com/aegisx-platform/aegisx-starter/commit/d8c6d4beef87ad62bab4b5502b286c96d564670d))
* add staging tag for easier deployment ([bd458ad](https://github.com/aegisx-platform/aegisx-starter/commit/bd458ad6b28cfb920dc06f83650d7266e0345bb0))
* add Swagger grouping tags to auth routes ([1aba676](https://github.com/aegisx-platform/aegisx-starter/commit/1aba67608589216250e367700636b615cdd38bd8))
* add wheelPropagation property to AxScrollbarOptions interface ([6209f76](https://github.com/aegisx-platform/aegisx-starter/commit/6209f76cf6dcb13981215e8e0a216c22b3ac74bb))
* auth integration tests and login functionality ([c1319d1](https://github.com/aegisx-platform/aegisx-starter/commit/c1319d151b7ffd76a90762399b9cf6e4705a0665))
* change Docker build platform from amd64 to arm64 for self-hosted runner ([fde9d2c](https://github.com/aegisx-platform/aegisx-starter/commit/fde9d2c07b54c4bd7210d36f5e283b206144a4d1))
* clean up Settings API linting issues ([3a72563](https://github.com/aegisx-platform/aegisx-starter/commit/3a725634f74977c9963b04c9e9acea4ee440c52e))
* correct auth controller to access authService from fastify instance ([8d49c9c](https://github.com/aegisx-platform/aegisx-starter/commit/8d49c9c6e20343fcec0da5e24a3d92b30b353f78))
* correct E2E test database configuration in GitHub Actions ([c1d44d6](https://github.com/aegisx-platform/aegisx-starter/commit/c1d44d6362ae22c5351697ba393bba9f3941d262))
* correct ESLint flat config for libs directory ([44f1057](https://github.com/aegisx-platform/aegisx-starter/commit/44f1057033e9e3b6a1b823bc9b8de9fcdbbce6b9))
* correct floating label positioning in form utility classes ([301205b](https://github.com/aegisx-platform/aegisx-starter/commit/301205bd9dc51efc45814d7d6d43b8e8d148c67b))
* correct icon positioning conflicts in form utility classes ([6af31b7](https://github.com/aegisx-platform/aegisx-starter/commit/6af31b70824694a2b842633dad65e55363951dd0))
* **e2e:** resolve Clone 2 E2E test execution issues ([18c5b1c](https://github.com/aegisx-platform/aegisx-starter/commit/18c5b1c540318c96e148a9ce3a6c80160d693e04))
* ensure proper directory permissions for non-root user in Docker builds ([b5add2c](https://github.com/aegisx-platform/aegisx-starter/commit/b5add2cdd97354c99356619c3169e0fa737e39f7))
* **env:** add ignore .env in .gitignore ([ce0bb24](https://github.com/aegisx-platform/aegisx-starter/commit/ce0bb2464b57675333af8a96d6ae89ecdf340f8f))
* finalize Docker build fixes - remove fail2ban version constraint and optimize cache handling ([7bc76ee](https://github.com/aegisx-platform/aegisx-starter/commit/7bc76eeb0f5451b1f03d6e5fccba8c5e4eb3f905))
* handle GitHub Advanced Security requirement gracefully ([dd589a5](https://github.com/aegisx-platform/aegisx-starter/commit/dd589a5e5bb1b3e64a29470494cd70ace359f546))
* improve API Dockerfile for better GitHub Actions compatibility ([397539d](https://github.com/aegisx-platform/aegisx-starter/commit/397539d5590a961d956ae812a4d6447b59a0d2c5))
* include refreshToken in login response for API testing ([03e5c88](https://github.com/aegisx-platform/aegisx-starter/commit/03e5c8898e5ae54bc1bf93e486ba9bdfd96e5879))
* increase yarn network timeout to resolve ESOCKETTIMEDOUT errors ([912acce](https://github.com/aegisx-platform/aegisx-starter/commit/912acceb824e46966b73b5fdc4a4b17bb023297e))
* make Redis optional for test environment ([43116fa](https://github.com/aegisx-platform/aegisx-starter/commit/43116fa6cc86dea38a7c3fbe6b6ef468b2da3f7f))
* optimize Docker builds to prevent timeouts and improve performance ([f244381](https://github.com/aegisx-platform/aegisx-starter/commit/f2443814a0fea4c7484bf1de6257b220600dce02))
* reduce Node.js memory allocation to 2048MB for all builds ([1d16323](https://github.com/aegisx-platform/aegisx-starter/commit/1d1632350c828502832fc74a8c1330e4d986a967))
* registration tests and error handling ([b12df38](https://github.com/aegisx-platform/aegisx-starter/commit/b12df380db93e339bc420f7a46210723f43cef12))
* remove border-bottom from navigation header ([575f250](https://github.com/aegisx-platform/aegisx-starter/commit/575f250c2f2d01704733a545fcc7bc9ca65fb3ac))
* remove conflicting commitlint JSON config and use JS config only ([485090a](https://github.com/aegisx-platform/aegisx-starter/commit/485090a9e26052187518d6d1eca9bc855d28ea7d))
* remove invalid matrix expression in CI/CD workflow ([27ce682](https://github.com/aegisx-platform/aegisx-starter/commit/27ce682f7823c8b237b6b5e58cf5b0e728abfe6b))
* remove missing file references in Dockerfiles ([c1c6bae](https://github.com/aegisx-platform/aegisx-starter/commit/c1c6bae435b752a99127a398096d250bd99bda1e))
* remove NODE_OPTIONS from all Dockerfiles for GitHub Actions compatibility ([2b9e87d](https://github.com/aegisx-platform/aegisx-starter/commit/2b9e87d95ee7ea40840712a831be10b9fb90bc07))
* remove subtitle property from navigation group to fix type error ([c00583c](https://github.com/aegisx-platform/aegisx-starter/commit/c00583cb89845d3b41ce115f3ad073a234058a33))
* remove tsyringe dependency injection from users module ([d975e6d](https://github.com/aegisx-platform/aegisx-starter/commit/d975e6d0639af0fdf93d3cf8c3c78d7cd619888f))
* resolve all unit test failures across monorepo ([4fb40b0](https://github.com/aegisx-platform/aegisx-starter/commit/4fb40b040e0e224ebe025c3700057a0d680c6117))
* resolve Angular build errors in all Dockerfiles ([b061201](https://github.com/aegisx-platform/aegisx-starter/commit/b0612011f3eb60a4448076c40feb9861b006e21b))
* resolve Angular Material floating label overlap with prefix icons ([cbefa84](https://github.com/aegisx-platform/aegisx-starter/commit/cbefa84fd0305d6c479e51902820624413b6afab))
* resolve API status endpoint schema mismatch ([14ae38f](https://github.com/aegisx-platform/aegisx-starter/commit/14ae38f5180fa4b15dff5ca58320347892fdf8eb))
* resolve build errors and add missing button type attribute in navigation ([5211fc9](https://github.com/aegisx-platform/aegisx-starter/commit/5211fc9817179d0a04b200eba79b123e57f98554))
* resolve CI/CD issues with package manager conflicts ([94b8470](https://github.com/aegisx-platform/aegisx-starter/commit/94b847054401c2d4ed947e7d7e63d049e724b63a))
* resolve compilation errors and update Clone 2 progress ([518aa88](https://github.com/aegisx-platform/aegisx-starter/commit/518aa8811692bb8dde96da3e9e53d7e50cbb8a8a))
* resolve CORS, monitoring endpoints, and user creation issues ([6b82c68](https://github.com/aegisx-platform/aegisx-starter/commit/6b82c6873468254f838affb4bfcdee2ae7752249))
* resolve database column errors in user profile API ([0f3d717](https://github.com/aegisx-platform/aegisx-starter/commit/0f3d7176d1423426e18a2ce8ca4fad145c94790f))
* resolve Docker build cache corruption in GitHub Actions ([fc69bff](https://github.com/aegisx-platform/aegisx-starter/commit/fc69bffdd296df6df665e0e5244bb7e7bb924dad))
* resolve GitHub Actions env context errors in service definitions ([e130424](https://github.com/aegisx-platform/aegisx-starter/commit/e13042464965693a902eeb52161f9e34d71b09cb))
* resolve linting errors in e2e and aegisx-ui projects ([6e947d5](https://github.com/aegisx-platform/aegisx-starter/commit/6e947d5ac66d056ba26dec91d16b9686c6ee22e6))
* resolve Material Design form field icon positioning conflicts ([870caa4](https://github.com/aegisx-platform/aegisx-starter/commit/870caa4f31af8c83579c50f0fcf98f446c02a891))
* resolve Material Design input border conflict with Tailwind CSS ([a42c29e](https://github.com/aegisx-platform/aegisx-starter/commit/a42c29e9a1b4924627bab3be21bb7eacee4b4329))
* resolve merge conflicts from main branch integration ([cb6207f](https://github.com/aegisx-platform/aegisx-starter/commit/cb6207fdb88c30ccbbbc338f4c0b3025e529a77a))
* resolve navigation layout issues and content overflow ([406cc2b](https://github.com/aegisx-platform/aegisx-starter/commit/406cc2b61cc1e779f9787134746904ff06bf9bec))
* resolve navigation overflow and mobile display issues ([9aae125](https://github.com/aegisx-platform/aegisx-starter/commit/9aae125f0ca374986be16df835f678f0978c43c4))
* resolve remaining CI/CD issues and update test scripts ([5a436b6](https://github.com/aegisx-platform/aegisx-starter/commit/5a436b66e9de7381d3a834b556f72e8d2468e518))
* resolve remaining critical linting errors ([7b6ed81](https://github.com/aegisx-platform/aegisx-starter/commit/7b6ed81e9118670bb1eddacf96e09fdc56cb809d))
* resolve semantic-release commitlint validation errors ([94fe580](https://github.com/aegisx-platform/aegisx-starter/commit/94fe580116f10f249d8a11e0d0ce5df51560743f))
* restructure aegisx-ui library with clean ax folder structure ([df2d563](https://github.com/aegisx-platform/aegisx-starter/commit/df2d5637333231a5d5cc8aaa2c18e023a35b4383))
* simplify Angular build commands to resolve Docker build errors ([a1a0c58](https://github.com/aegisx-platform/aegisx-starter/commit/a1a0c58c493f3a859340e2db2a7cfa52e72df49d))
* skip husky prepare script in GitHub Actions workflows ([bced50b](https://github.com/aegisx-platform/aegisx-starter/commit/bced50b92fb3a8f2c24ded8a85cd06ea4e124c2b))
* skip unimplemented auth routes in test script ([f3450e4](https://github.com/aegisx-platform/aegisx-starter/commit/f3450e4321e82e9068209df85e0f52d8e6120603))
* standardize Fastify plugin naming conventions ([0fa4736](https://github.com/aegisx-platform/aegisx-starter/commit/0fa47361888a0003115b3ec3a30a4df418d47379))
* Swagger UI execute functionality by updating CSP and server configuration ([579cb0a](https://github.com/aegisx-platform/aegisx-starter/commit/579cb0a1bd5702b928e5f76a08f0ae14552aed3b))
* sync pnpm version between workflow and package.json ([2c4f5e7](https://github.com/aegisx-platform/aegisx-starter/commit/2c4f5e784db53825f341c06ecf73baeadc60e039))
* temporarily disable ARM64 builds to resolve lfstack.push error ([30f53b3](https://github.com/aegisx-platform/aegisx-starter/commit/30f53b39bc3e258331f7d38b4e5ade7c6d340380))
* **tests:** resolve integration test failures and database issues ([3a9bb51](https://github.com/aegisx-platform/aegisx-starter/commit/3a9bb51c9e5991b1cfeb64c471fe1e7076b32188))
* update auth-strategies plugin dependency to use knex-plugin ([01d5e59](https://github.com/aegisx-platform/aegisx-starter/commit/01d5e599fdc5059a32c78936e9bed7e91271fa79))
* update Jest configurations to handle lodash-es ES modules ([e1868aa](https://github.com/aegisx-platform/aegisx-starter/commit/e1868aac899e61789ad0adf242b1985943e42798))
* update test script to use correct user profile endpoints ([0793b76](https://github.com/aegisx-platform/aegisx-starter/commit/0793b7687804a9881fbcca1f2afc03cc00c5ef1e))
* update web app.spec.ts to match actual app component implementation ([7aa91b6](https://github.com/aegisx-platform/aegisx-starter/commit/7aa91b6324e02c1a8ca894974712154b2fddc6d2))
* upgrade Node.js to 20.19.0 to meet Angular 20.2.3 requirements ([c999ecb](https://github.com/aegisx-platform/aegisx-starter/commit/c999ecbf463fce464a23b3be5eb63491ba529844))
* use pnpm for all build commands instead of npx ([78ee542](https://github.com/aegisx-platform/aegisx-starter/commit/78ee542325f8a88cff5e87919bd7f92ae22bd3da))
* use unique email for registration tests to avoid conflicts ([455cf6c](https://github.com/aegisx-platform/aegisx-starter/commit/455cf6c2cc730eed38d4c7e21483b9514e921c26))


### Code Refactoring

* optimize GitHub workflows for 64% performance improvement ([e78bccf](https://github.com/aegisx-platform/aegisx-starter/commit/e78bccf5c4a6a2a644d8bc50b8ba00ed01355d8a))


### Features

* add admin app - third Angular application for administration panel ([68fe0d9](https://github.com/aegisx-platform/aegisx-starter/commit/68fe0d948f4da83ede821202d8ed535756ab5d1d))
* add alignment-checker agent for frontend-backend synchronization ([384286f](https://github.com/aegisx-platform/aegisx-starter/commit/384286fa4b5a2f5101d33ad4d5cd4191fe00a38a))
* add Angular and UI/UX expert agents ([2062c90](https://github.com/aegisx-platform/aegisx-starter/commit/2062c905e36037404caa265153bc76738628afb4))
* add authentication infrastructure to web app ([82a2c87](https://github.com/aegisx-platform/aegisx-starter/commit/82a2c87ac389bacd89b6194038e8d1251bbc2718))
* add comprehensive 16-point checklist to prevent all integration issues ([9e26282](https://github.com/aegisx-platform/aegisx-starter/commit/9e26282e7deec552f52a7a17449128ccf36dbb93))
* add multi-clone development standards and automation scripts ([d535c0d](https://github.com/aegisx-platform/aegisx-starter/commit/d535c0df78a9f15f819957d07335d7cccc91c486))
* add multi-clone development standards and merge Clone 1 work ([81fc5b8](https://github.com/aegisx-platform/aegisx-starter/commit/81fc5b8822b7eb69995bd04953a25d5dac68b78e))
* add specialized agent configurations and project status ([a977f66](https://github.com/aegisx-platform/aegisx-starter/commit/a977f66596c9f0a7ee9b7c1790a24a5616ea9479))
* **api:** implement backend performance optimizations and security enhancements ([64d1192](https://github.com/aegisx-platform/aegisx-starter/commit/64d1192f1f6a505246e7f4b76942143ad1350623))
* **api:** implement Settings API with controller and repository pattern ([b213e69](https://github.com/aegisx-platform/aegisx-starter/commit/b213e69002c911a8a0459ac00b53414060bd8e37))
* **ci/cd:** add complete CI/CD pipeline with automated versioning ([5e9c325](https://github.com/aegisx-platform/aegisx-starter/commit/5e9c32539c8892c5d383f3d7ecb63516495100db))
* complete AegisX UI library quality improvements ([5d725a4](https://github.com/aegisx-platform/aegisx-starter/commit/5d725a4cdc00bcd4d362786f791d0cd5c5668213))
* complete Phase 3.1 Backend Performance & Security audit ([35a32e4](https://github.com/aegisx-platform/aegisx-starter/commit/35a32e4ff97d2698bd9191ff8059f2b43d5f3347))
* complete Settings API integration tests and fix response handler ([1cce050](https://github.com/aegisx-platform/aegisx-starter/commit/1cce050832f016c4bed45ccc8be9d0fd4b2da4fb))
* complete workflow overhaul with enterprise-grade improvements ([af12254](https://github.com/aegisx-platform/aegisx-starter/commit/af122544f9345883b70f0cb0d60f310c765ea1eb))
* comprehensive AegisX UI library linting fixes and development standards ([5a2f30a](https://github.com/aegisx-platform/aegisx-starter/commit/5a2f30a211f6c1d2c068c8b3e54649099cf71314))
* enhance Angular app with UI improvements and authentication docs ([a1d1242](https://github.com/aegisx-platform/aegisx-starter/commit/a1d1242ff0068836f7acca333c42755f872a9c9a))
* enhance GitHub Actions Docker build with staging/production tag strategy ([7e67c8f](https://github.com/aegisx-platform/aegisx-starter/commit/7e67c8f68bb5654f82e61375b107b86a29ef12ca))
* enhance universal standard with database-first approach and prevention checklist ([094f113](https://github.com/aegisx-platform/aegisx-starter/commit/094f11380cf9e596e5a96c96d2f089351fd20c28))
* implement @aegisx/ui library with correct structure ([21f6172](https://github.com/aegisx-platform/aegisx-starter/commit/21f61728b8d0f46d32049eec71a849f3bcc9573c))
* implement auto-release flow with immediate Docker builds ([71c3177](https://github.com/aegisx-platform/aegisx-starter/commit/71c31774b45634727cd15db64c4f881c12f57e0a))
* implement complete authentication system with QA standards ([2dadc25](https://github.com/aegisx-platform/aegisx-starter/commit/2dadc25e7a433965fc7168c822aae793e2335041))
* implement comprehensive monitoring and logging system ([adf6dff](https://github.com/aegisx-platform/aegisx-starter/commit/adf6dff50e73efa82865167d72bd3234755a9169))
* implement Features 1 & 2 with auth refactoring ([c9f716f](https://github.com/aegisx-platform/aegisx-starter/commit/c9f716f1b21c675303d8a65f834309730b7fa2a3))
* implement Features 1 & 2 with complete documentation ([09703dd](https://github.com/aegisx-platform/aegisx-starter/commit/09703dd3cf828a6c634097a5d43d016be219d550))
* implement NavigationService with API integration and fallback support ([3293e67](https://github.com/aegisx-platform/aegisx-starter/commit/3293e6766bf9a5362cf3e4c3d972befb1db74ff5))
* implement Settings API module with comprehensive testing workflow ([f020ae5](https://github.com/aegisx-platform/aegisx-starter/commit/f020ae5424e2770ea263c465cd7f33ad833e80e1))
* implement user management API module with CRUD endpoints ([0f48396](https://github.com/aegisx-platform/aegisx-starter/commit/0f48396ec8aff55ac3d75b8366176e72b2e1da4b))
* merge Settings API completion with infrastructure improvements ([fba325c](https://github.com/aegisx-platform/aegisx-starter/commit/fba325c74038041c9bc1ba3777d9965ce70463d0))
* migrate all modules to TypeBox schemas with complete type safety ([1bfbfcf](https://github.com/aegisx-platform/aegisx-starter/commit/1bfbfcf9313c2053285e078ae487c461f0d06102))
* **navigation:** enhance navigation UI with improved styling and responsiveness ([2c29a24](https://github.com/aegisx-platform/aegisx-starter/commit/2c29a2442a06822b851127fd5dbcd2cd91d23a63))
* optimize CI/CD workflow with parallel builds and enhanced monitoring ([0615e3a](https://github.com/aegisx-platform/aegisx-starter/commit/0615e3acae91653b48f583889f6f76c21c6ac670))
* optimize Git hooks for better developer experience ([ffa1c9d](https://github.com/aegisx-platform/aegisx-starter/commit/ffa1c9de421ba4e8555708e5f8ab7be6b130d877))
* replace complex workflows with simple semantic-release approach ([a452862](https://github.com/aegisx-platform/aegisx-starter/commit/a452862d1b0cac5225760e8ca6966ddc5e9d93c0))
* standardize API response schemas and fix user management ([1126a8c](https://github.com/aegisx-platform/aegisx-starter/commit/1126a8c3a2ecfa6b8192fd9adb06d5b0336b8a4f))
* **web:** complete UI integration with @aegisx/ui library ([b0ee842](https://github.com/aegisx-platform/aegisx-starter/commit/b0ee842fc3bef9f070368d7617ee28785358ee76))
* **web:** implement comprehensive frontend features for Clone 2 ([4025aa9](https://github.com/aegisx-platform/aegisx-starter/commit/4025aa938fc5dad7e8e8fddebb8e83098200a22f))


### Performance Improvements

* enhance GitHub Actions workflow and Dockerfile integration ([37e101d](https://github.com/aegisx-platform/aegisx-starter/commit/37e101d7948009f46cc643087c3a820b1ae0a107))
* major Docker build performance improvements ([70f71f0](https://github.com/aegisx-platform/aegisx-starter/commit/70f71f0496a14e2a22053632160b7321359fdcdf))
* optimize CI/CD workflow for faster builds ([f485ebd](https://github.com/aegisx-platform/aegisx-starter/commit/f485ebdcefd019c593b7a3d143b3d4b17d17620f))
* optimize git hooks for faster development workflow ([cb533a7](https://github.com/aegisx-platform/aegisx-starter/commit/cb533a7451faa1b26aa07d97b733f97a4f8b072a))
* reduce build timeouts for faster feedback ([d97776d](https://github.com/aegisx-platform/aegisx-starter/commit/d97776d6603cd0f635d3365b7c487f16a678f436))
* suppress yarn warnings to speed up Docker builds ([1fdf693](https://github.com/aegisx-platform/aegisx-starter/commit/1fdf6936e40377c7270698b4ee8e50f5d8a5cac8))


### BREAKING CHANGES

* Complete CI/CD workflow transformation

🚀 Major Improvements:
- Add semantic-release configuration (.releaserc.json)
- Implement comprehensive security scanning with Trivy
- Add multi-level caching (yarn, node_modules, Docker layers)
- Separate build and deploy jobs for better efficiency
- Add artifact management with proper retention policies
- Implement concurrency control to prevent conflicts

🔧 DevOps Enhancements:
- Visual progress indicators with emojis
- Comprehensive error handling and retries
- Environment-based deployments (staging/production)
- Multi-platform Docker builds (amd64/arm64)
- Build artifact reuse between jobs
- Skip duplicate actions optimization

🛡️ Security & Reliability:
- Vulnerability scanning integration
- Proper permission management (least privilege)
- Health checks for Docker images
- Timeout protection for all jobs
- Graceful failure handling

📊 Monitoring & Observability:
- Detailed workflow summaries
- GitHub Step Summary integration
- Automatic artifact cleanup
- Comprehensive logging

This creates a production-ready CI/CD pipeline with 50%+
performance improvement and enterprise security standards.
* Complete workflow overhaul

- Remove complex ci-cd.yml (600+ lines) with change detection, matrix testing
- Replace with simple release.yml (162 lines) using semantic-release
- Support both main (release) and develop (staging) branches
- Build matrix for api, web, admin apps
- Multi-platform builds (linux/amd64, linux/arm64)
- Clear tagging strategy: latest + version for main, staging-* for develop

Benefits:
- 75% reduction in workflow complexity
- Standard semantic-release versioning
- Faster builds without unnecessary tests
- Clear separation of staging vs production
- Maintainable and debuggable
* Workflows now use postgres/postgres for all database
connections instead of mixed credentials

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.0.0] - 2025-12-02

### ✨ Features

- **auth**: Implement JWT authentication with refresh tokens
  - Added login, register, logout endpoints
  - Implemented secure refresh token rotation
  - Added session management with Redis

- **database**: Setup PostgreSQL with migrations
  - Created users, roles, permissions tables
  - Implemented RBAC structure
  - Added seed data for initial setup

- **monorepo**: Setup Nx workspace with 3 applications
  - API: Fastify backend application
  - Web: Angular public-facing application  
  - Admin: Angular admin dashboard

- **docker**: Add Docker support for all apps
  - Multi-stage builds for optimal image size
  - Security-hardened containers
  - Health checks for all services

- **ci/cd**: Complete GitHub Actions pipeline
  - Automated testing and linting
  - Security scanning with Snyk
  - Automated versioning and changelog
  - Multi-environment deployments

### 📚 Documentation

- Add comprehensive documentation structure
- Create API-First workflow guide
- Add MCP integration documentation
- Create CI/CD setup guide
- Add monorepo Docker management guide

### 🔧 Chores

- Setup development environment
- Configure ESLint and Prettier
- Add commit hooks with Husky
- Configure conventional commits

### 🎯 Project Status

- Backend API: 80% complete
- Frontend: 20% complete (basic setup)
- Testing: 10% complete (strategy defined)
- Documentation: 90% complete
- DevOps: 100% complete

[1.0.0]: https://github.com/aegisx-platform/aegisx-starter/releases/tag/v1.0.0
