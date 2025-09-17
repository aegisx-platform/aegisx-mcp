## [1.1.1](https://github.com/aegisx-platform/aegisx-starter/compare/v1.1.0...v1.1.1) (2025-09-17)

### Bug Fixes

- **release:** improve semantic-release configuration for reliable versioning ([d18b1d0](https://github.com/aegisx-platform/aegisx-starter/commit/d18b1d0d4cbcb7e5634bb4b57d29589ca1568594))

# [1.1.0](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.12...v1.1.0) (2025-09-15)

### Bug Fixes

- add /api prefix to user management routes ([cf8c253](https://github.com/aegisx-platform/aegisx-starter/commit/cf8c25332117bd6bfdd0066b2ff180ab30e679a4))
- add body schema for avatar upload endpoint ([5e50fae](https://github.com/aegisx-platform/aegisx-starter/commit/5e50fae3600946187cc4f7a392245a56e6132f58))
- add comprehensive debugging for self-hosted runner build issues ([2356c28](https://github.com/aegisx-platform/aegisx-starter/commit/2356c28921686b483967193afeacd67c11f5ec16))
- add comprehensive Docker build optimizations for all apps ([3b92924](https://github.com/aegisx-platform/aegisx-starter/commit/3b929248f1c4fe41923d6a8a9da5863d6328f078))
- add missing JWT authentication middleware to auth routes ([e2b8009](https://github.com/aegisx-platform/aegisx-starter/commit/e2b8009e583109098eb8a1fd7dded43920ebbdfa))
- add no-cache flag to all Docker builds to force fresh nginx configs ([72ed074](https://github.com/aegisx-platform/aegisx-starter/commit/72ed0741c3fb094431d19851cf82931d7eac95cc))
- add Node.js memory optimization to all Dockerfiles ([a1d79e9](https://github.com/aegisx-platform/aegisx-starter/commit/a1d79e98f59baaf626b973a45b49964aacfe14f4))
- add reflect-metadata import for tsyringe dependency injection ([3353ef8](https://github.com/aegisx-platform/aegisx-starter/commit/3353ef8a5bc253f59ae104efb6ec4c2f087d787b))
- add schemas-plugin dependency to all module plugins to prevent startup crash ([8d5ee4d](https://github.com/aegisx-platform/aegisx-starter/commit/8d5ee4dda208de4bb8da9d1fc1c4cd1128a375f7))
- add staging tag for easier deployment ([bdf3c64](https://github.com/aegisx-platform/aegisx-starter/commit/bdf3c64a97e71d9fbba489b56d36f92acdb4e6b6))
- add Swagger grouping tags to auth routes ([0968996](https://github.com/aegisx-platform/aegisx-starter/commit/09689966f69e52a969b117d7d84f42acf8693b75))
- add wheelPropagation property to AxScrollbarOptions interface ([8b784d6](https://github.com/aegisx-platform/aegisx-starter/commit/8b784d6c8da0c1903f9b68da16700822acb1d3cf))
- auth integration tests and login functionality ([3711f5b](https://github.com/aegisx-platform/aegisx-starter/commit/3711f5bfaedd527a07e8c64d3ca9b057ebed985e))
- change Docker build platform from amd64 to arm64 for self-hosted runner ([56fd2eb](https://github.com/aegisx-platform/aegisx-starter/commit/56fd2eba573ff69f618fa9626ea10c98e414bf3f))
- clean up Settings API linting issues ([5f22cf1](https://github.com/aegisx-platform/aegisx-starter/commit/5f22cf1507026222d910a331409dfd4e8d0bc732))
- clean up v2.x.x releases and restore clean v1.0.11 state ([b6f0eef](https://github.com/aegisx-platform/aegisx-starter/commit/b6f0eefaabaccddcd3adf638cdced711468ea771))
- **compose:** chang redis port in docker compose to 5432 ([1cea86b](https://github.com/aegisx-platform/aegisx-starter/commit/1cea86b78261f5b450737fa2cc46882dd5a25076))
- **compose:** chang redis port in docker compose to 5432 ([fca2755](https://github.com/aegisx-platform/aegisx-starter/commit/fca2755f1324ff2ee824cd7a3ce5994c1ea815b9))
- connect frontend to real API endpoints ([b05acc5](https://github.com/aegisx-platform/aegisx-starter/commit/b05acc5933c599751bc8da8abea6ee42e03a49d5))
- correct auth controller to access authService from fastify instance ([1edf134](https://github.com/aegisx-platform/aegisx-starter/commit/1edf1349de60a0d23370fd67dd9618e3088177da))
- correct E2E test database configuration in GitHub Actions ([92ddba7](https://github.com/aegisx-platform/aegisx-starter/commit/92ddba723b0fa746287b2f202c6a0fea9cba24f9))
- correct ESLint flat config for libs directory ([7ddaeaf](https://github.com/aegisx-platform/aegisx-starter/commit/7ddaeafe6fc7a6f0309479629dc8b0fa50440d06))
- correct floating label positioning in form utility classes ([d58f60b](https://github.com/aegisx-platform/aegisx-starter/commit/d58f60b700c465073ba212b508aa71eee85e43b3))
- correct icon positioning conflicts in form utility classes ([11f23d4](https://github.com/aegisx-platform/aegisx-starter/commit/11f23d4e70a46fb49a804d1f2aa5e36f82db4e42))
- **dockerfile:** add space ([e07157f](https://github.com/aegisx-platform/aegisx-starter/commit/e07157fea9b103b453a86fa5ed9b2ec5fb5201fc))
- **e2e:** resolve Clone 2 E2E test execution issues ([f93e2f6](https://github.com/aegisx-platform/aegisx-starter/commit/f93e2f6bd51eba52609cf2e3925d316db273ca81))
- ensure proper directory permissions for non-root user in Docker builds ([cdb2632](https://github.com/aegisx-platform/aegisx-starter/commit/cdb2632bd33e58fc162871444ac8dc460d67d5c7))
- **env:** add ignore .env in .gitignore ([ce0bb24](https://github.com/aegisx-platform/aegisx-starter/commit/ce0bb2464b57675333af8a96d6ae89ecdf340f8f))
- finalize Docker build fixes - remove fail2ban version constraint and optimize cache handling ([b0eef79](https://github.com/aegisx-platform/aegisx-starter/commit/b0eef79adc72f995ccfcb01801e61eb5c2fbf601))
- force complete Docker cache clear to resolve nginx validation issues ([9bd3df0](https://github.com/aegisx-platform/aegisx-starter/commit/9bd3df03fa1e73bfe2be2abd89dd3a2fd07742a8))
- force Docker image pulls and ensure clean nginx configs ([5ea34ef](https://github.com/aegisx-platform/aegisx-starter/commit/5ea34efa7466660368524fb94477d6a964bd7081))
- force nginx config refresh for Docker builds ([cfdf913](https://github.com/aegisx-platform/aegisx-starter/commit/cfdf9138923eecb035f1d28f8d254ad17428c2c1))
- force nginx config refresh with content changes ([20fe663](https://github.com/aegisx-platform/aegisx-starter/commit/20fe663a153dcf180801c523c59d5c27dbf49bd6))
- handle GitHub Advanced Security requirement gracefully ([62d400f](https://github.com/aegisx-platform/aegisx-starter/commit/62d400fd5901196538052ff500df05c7b4697b52))
- implement avatar display and authentication improvements ([aea0ceb](https://github.com/aegisx-platform/aegisx-starter/commit/aea0ceb07bda062f359ac0a99d6fde32430ec69b))
- improve API Dockerfile for better GitHub Actions compatibility ([e7b14a7](https://github.com/aegisx-platform/aegisx-starter/commit/e7b14a7f8cf8d8ba139851ac0cb71fd9d1e630d7))
- include refreshToken in login response for API testing ([e46c907](https://github.com/aegisx-platform/aegisx-starter/commit/e46c907e47f4194a10e62ed9793294515de34512))
- increase yarn network timeout to resolve ESOCKETTIMEDOUT errors ([f0bf6cb](https://github.com/aegisx-platform/aegisx-starter/commit/f0bf6cbd6e9e7a106cfd4c033302d4f25b97659a))
- make Redis optional for test environment ([9eb6d98](https://github.com/aegisx-platform/aegisx-starter/commit/9eb6d98fddb666af65de21bb30e60846c7a4847d))
- optimize Docker builds to prevent timeouts and improve performance ([df3fff4](https://github.com/aegisx-platform/aegisx-starter/commit/df3fff444e0914b58f6129745bf86010445f323a))
- optimize navigation service loading to prevent API calls on login page ([6561ae7](https://github.com/aegisx-platform/aegisx-starter/commit/6561ae7bb0a7b158e6e7400ba67de78130f3baef))
- prevent duplicate API calls for navigation and activity stats ([1cbbcb2](https://github.com/aegisx-platform/aegisx-starter/commit/1cbbcb2f00cfa7e3f613d42a912b31c159289a06))
- reduce Node.js memory allocation to 2048MB for all builds ([820a77c](https://github.com/aegisx-platform/aegisx-starter/commit/820a77cc424425f30eadbeff10fa155bb46885d4))
- registration tests and error handling ([9e23fda](https://github.com/aegisx-platform/aegisx-starter/commit/9e23fda04fdf4f451a8bf173d84a5b573dc30e24))
- remove .env.local from git tracking ([96343c7](https://github.com/aegisx-platform/aegisx-starter/commit/96343c70084d9640dc932c30452820e03bb264b8))
- remove border-bottom from navigation header ([f21cec4](https://github.com/aegisx-platform/aegisx-starter/commit/f21cec4fcb70fe176070cdfa739aefd1f1e62b3b))
- remove conflicting commitlint JSON config and use JS config only ([9bf9441](https://github.com/aegisx-platform/aegisx-starter/commit/9bf944135efbeacfcec920a4f9f094233f17933b))
- remove github workflow ([e24dcd9](https://github.com/aegisx-platform/aegisx-starter/commit/e24dcd927a62e0b26c2c0563ba6a4f4a7973c8a1))
- remove invalid matrix expression in CI/CD workflow ([f36cee1](https://github.com/aegisx-platform/aegisx-starter/commit/f36cee1b1eb608f143b1151f8ef6f0c3af5dcd06))
- remove invalid must-revalidate from nginx gzip_proxied directive ([bb97d81](https://github.com/aegisx-platform/aegisx-starter/commit/bb97d814204a7c2015837cd92052dec9d30420ad))
- remove missing file references in Dockerfiles ([881e448](https://github.com/aegisx-platform/aegisx-starter/commit/881e448b71d3b91c7543eeb5331c40aa4fe6377c))
- remove must-revalidate from Cache-Control headers in nginx configs ([b256bdb](https://github.com/aegisx-platform/aegisx-starter/commit/b256bdb14459b93aa00f4f947e1988b75c39b433))
- remove must-revalidate from ssl setup script nginx config template ([d12448f](https://github.com/aegisx-platform/aegisx-starter/commit/d12448ff5c01dd623d1a0b8b6ffda8d6acbfb5a6))
- remove NODE_OPTIONS from all Dockerfiles for GitHub Actions compatibility ([2ef2432](https://github.com/aegisx-platform/aegisx-starter/commit/2ef2432057345131565e0b0222cbaefad19a5087))
- remove subtitle property from navigation group to fix type error ([673fab0](https://github.com/aegisx-platform/aegisx-starter/commit/673fab0add902025ae001e47713ab56561d31b12))
- remove tsyringe dependency injection from users module ([dcc4cb6](https://github.com/aegisx-platform/aegisx-starter/commit/dcc4cb6e7de0c2c131c9acdeabc7413f159f1a27))
- resolve all unit test failures across monorepo ([87d16d8](https://github.com/aegisx-platform/aegisx-starter/commit/87d16d80a621f229e6634922ab33bde80d24afc1))
- resolve Angular build errors in all Dockerfiles ([5005b23](https://github.com/aegisx-platform/aegisx-starter/commit/5005b2344729c27e79ae82981a9cce54068a4763))
- resolve Angular Material floating label overlap with prefix icons ([e8e53b3](https://github.com/aegisx-platform/aegisx-starter/commit/e8e53b352cf356d43a00d300bad65779669bec85))
- resolve API status endpoint schema mismatch ([6d4f04c](https://github.com/aegisx-platform/aegisx-starter/commit/6d4f04ca83bcbe412e40fbb162a809e6b3c78465))
- resolve avatar upload multipart/form-data validation ([bea2174](https://github.com/aegisx-platform/aegisx-starter/commit/bea2174f71e3a9b959e847be87dd8795ea734b52))
- resolve build errors and add missing button type attribute in navigation ([2a2d562](https://github.com/aegisx-platform/aegisx-starter/commit/2a2d56242f62e2365afbd332b07f995fec3a47aa))
- resolve CI/CD issues with package manager conflicts ([3e98880](https://github.com/aegisx-platform/aegisx-starter/commit/3e988803b91888e8ef2a1462e44230ad4385e517))
- resolve compilation errors and update Clone 2 progress ([7a7071b](https://github.com/aegisx-platform/aegisx-starter/commit/7a7071b7b17dd9e7a085e85257313d6d70e501ac))
- resolve component showcase compilation errors and restore SCSS files ([dfb25ae](https://github.com/aegisx-platform/aegisx-starter/commit/dfb25ae40fca23af4c9c6a3155583d4e6fe5717e))
- resolve CORS, monitoring endpoints, and user creation issues ([0a0189c](https://github.com/aegisx-platform/aegisx-starter/commit/0a0189cbe5836759264af3d437b8efd684cc692d))
- resolve database column errors in user profile API ([0f3d717](https://github.com/aegisx-platform/aegisx-starter/commit/0f3d7176d1423426e18a2ce8ca4fad145c94790f))
- resolve Docker build cache corruption in GitHub Actions ([adbccbf](https://github.com/aegisx-platform/aegisx-starter/commit/adbccbf802070e715dfc97535d27b5172c1bec4b))
- resolve GitHub Actions env context errors in service definitions ([517e732](https://github.com/aegisx-platform/aegisx-starter/commit/517e732566c1331c95ac2f2f16d91d3ac207ac58))
- resolve linting errors in e2e and aegisx-ui projects ([188fa0b](https://github.com/aegisx-platform/aegisx-starter/commit/188fa0bae529b1f325e7db091037f5123979b792))
- resolve linting errors in E2E test for empty arrow functions ([8f54b8a](https://github.com/aegisx-platform/aegisx-starter/commit/8f54b8a2bdbf5e30779b26c8de4375edf1b239cc))
- resolve Material Design form field icon positioning conflicts ([760d619](https://github.com/aegisx-platform/aegisx-starter/commit/760d6190e4abf8f97c663534fff8e24bc4dd4b46))
- resolve Material Design input border conflict with Tailwind CSS ([1a73ca2](https://github.com/aegisx-platform/aegisx-starter/commit/1a73ca29f5feb2633efc16e582b2138144e3b9bb))
- resolve merge conflicts from main branch integration ([b61ed16](https://github.com/aegisx-platform/aegisx-starter/commit/b61ed16003d92b4fd59d23658277729db92321e9))
- resolve navigation layout issues and content overflow ([415437f](https://github.com/aegisx-platform/aegisx-starter/commit/415437f4d93126d6d3cc27d41ebea2c4032b1d4a))
- resolve navigation overflow and mobile display issues ([189a600](https://github.com/aegisx-platform/aegisx-starter/commit/189a600004352f8c46b8fd4490e768ee2de726c9))
- resolve nginx configuration errors and update to pnpm ([7717b13](https://github.com/aegisx-platform/aegisx-starter/commit/7717b139c7770bc91101914c5542a5ea50b1a50f))
- resolve remaining CI/CD issues and update test scripts ([6f05ac1](https://github.com/aegisx-platform/aegisx-starter/commit/6f05ac1f609c3c5c0bacc91e29d22b31d984d03c))
- resolve remaining critical linting errors ([184540a](https://github.com/aegisx-platform/aegisx-starter/commit/184540ac781b681b7d267ca97a49d61b74f42114))
- resolve semantic-release commitlint validation errors ([68dc9f1](https://github.com/aegisx-platform/aegisx-starter/commit/68dc9f108c19e104e2f6b000bbf8ac924a0d9dbb))
- resolve user preferences API schema validation error ([c34796b](https://github.com/aegisx-platform/aegisx-starter/commit/c34796bbf6e97377e7db749a7002611684fc9c2b))
- restructure aegisx-ui library with clean ax folder structure ([427504e](https://github.com/aegisx-platform/aegisx-starter/commit/427504ef04794357ea8920940a4b509d58975705))
- simplify Angular build commands to resolve Docker build errors ([00e5b29](https://github.com/aegisx-platform/aegisx-starter/commit/00e5b291019721db7650ba7d283cad19e76a0ae5))
- skip husky prepare script in GitHub Actions workflows ([a9fc702](https://github.com/aegisx-platform/aegisx-starter/commit/a9fc702e4e55dca23d23abcdd1e311f8119277d6))
- skip unimplemented auth routes in test script ([9adc34a](https://github.com/aegisx-platform/aegisx-starter/commit/9adc34a2db5fca6f288718824aad438e55405153))
- standardize Fastify plugin naming conventions ([f219451](https://github.com/aegisx-platform/aegisx-starter/commit/f2194516e7334d228a11cb709ff5e71986567940))
- Swagger UI execute functionality by updating CSP and server configuration ([579cb0a](https://github.com/aegisx-platform/aegisx-starter/commit/579cb0a1bd5702b928e5f76a08f0ae14552aed3b))
- sync pnpm version between workflow and package.json ([8c9e329](https://github.com/aegisx-platform/aegisx-starter/commit/8c9e329b516c8688241bda7c48b882d6ee6dd91c))
- temporarily disable ARM64 builds to resolve lfstack.push error ([e6a5a6f](https://github.com/aegisx-platform/aegisx-starter/commit/e6a5a6ffc59e366bf1c2d0b2cd97c0a7a8e7dfc2))
- **tests:** resolve integration test failures and database issues ([861d624](https://github.com/aegisx-platform/aegisx-starter/commit/861d624f374f8e34b0f7b5b49bae255e9e9d15d2))
- update auth-strategies plugin dependency to use knex-plugin ([85a9924](https://github.com/aegisx-platform/aegisx-starter/commit/85a99247f677bcc19ffde44049085f4aa1768762))
- update Jest configurations to handle lodash-es ES modules ([e1d7794](https://github.com/aegisx-platform/aegisx-starter/commit/e1d77942535b2a3ce809e2e363e51c8cd0bee36f))
- update test script to use correct user profile endpoints ([67c172b](https://github.com/aegisx-platform/aegisx-starter/commit/67c172b71836093774f43c8ae9fc5df5800b1129))
- update web app.spec.ts to match actual app component implementation ([b610416](https://github.com/aegisx-platform/aegisx-starter/commit/b61041618a3a83b1af8449531fc2017aa711097c))
- upgrade Node.js to 20.19.0 to meet Angular 20.2.3 requirements ([b2bdb58](https://github.com/aegisx-platform/aegisx-starter/commit/b2bdb58a8a8ded8f3b609536e6e881dfdacbe8be))
- use pnpm for all build commands instead of npx ([0d1b83b](https://github.com/aegisx-platform/aegisx-starter/commit/0d1b83b870209abab946732747bad15358d8d4bb))
- use relative URLs for avatar images to work with Angular proxy ([5c9590f](https://github.com/aegisx-platform/aegisx-starter/commit/5c9590f7226f400bd15b64e09ff528c0067c4cc8))
- use unique email for registration tests to avoid conflicts ([da13d1f](https://github.com/aegisx-platform/aegisx-starter/commit/da13d1f8157b7c3500de7893708cfd84be3a178c))

### Code Refactoring

- optimize GitHub workflows for 64% performance improvement ([de8b867](https://github.com/aegisx-platform/aegisx-starter/commit/de8b867e633645febe0cda2909c102e8ff75cf9d))
- remove pgAdmin from Docker Compose files and documentation ([6991eb8](https://github.com/aegisx-platform/aegisx-starter/commit/6991eb86fa920a32c81a0f57380ae1b3eb642e04))

### Features

- add admin app - third Angular application for administration panel ([68fe0d9](https://github.com/aegisx-platform/aegisx-starter/commit/68fe0d948f4da83ede821202d8ed535756ab5d1d))
- add alignment-checker agent for frontend-backend synchronization ([384286f](https://github.com/aegisx-platform/aegisx-starter/commit/384286fa4b5a2f5101d33ad4d5cd4191fe00a38a))
- add Angular and UI/UX expert agents ([2062c90](https://github.com/aegisx-platform/aegisx-starter/commit/2062c905e36037404caa265153bc76738628afb4))
- add authentication infrastructure to web app ([3a08b33](https://github.com/aegisx-platform/aegisx-starter/commit/3a08b3397f712d6b92149b6c763eb9e1bdefa91a))
- add avatar display system with comprehensive testing ([a5dc839](https://github.com/aegisx-platform/aegisx-starter/commit/a5dc839b3ec88a2d3e23ac5b696604c7136c4345))
- add comprehensive 16-point checklist to prevent all integration issues ([f34cbc4](https://github.com/aegisx-platform/aegisx-starter/commit/f34cbc43d64dbb955b49619ae208221488627d33))
- add docker:ps script for instance-specific container status ([b6177ed](https://github.com/aegisx-platform/aegisx-starter/commit/b6177eda2c34b0dfb73db03a3c04a67ded8cdad1))
- add Feature Development Command Toolkit ([6ab6766](https://github.com/aegisx-platform/aegisx-starter/commit/6ab67666b6abf44b92fd03cee34a74908c336b56))
- add missing RBAC user_roles migration 014 ([6a58246](https://github.com/aegisx-platform/aegisx-starter/commit/6a582460f2bb6d717d767d1115086c03d80c9948))
- add multi-clone development standards and automation scripts ([5fbdaec](https://github.com/aegisx-platform/aegisx-starter/commit/5fbdaece80c3e638848137f30b3881da50d1e0fc))
- add multi-clone development standards and merge Clone 1 work ([e9fdde2](https://github.com/aegisx-platform/aegisx-starter/commit/e9fdde27854c875af470b66cba0d85dd4ffdf6d5))
- add specialized agent configurations and project status ([a977f66](https://github.com/aegisx-platform/aegisx-starter/commit/a977f66596c9f0a7ee9b7c1790a24a5616ea9479))
- **api:** implement backend performance optimizations and security enhancements ([e0acfc2](https://github.com/aegisx-platform/aegisx-starter/commit/e0acfc2163cf7df83becd9eb6d84dfc2b8cb788a))
- **api:** implement Settings API with controller and repository pattern ([2ed15d9](https://github.com/aegisx-platform/aegisx-starter/commit/2ed15d9e21fb0ef1df6adfbddfbb1bdf5f422d8b))
- **ci/cd:** add complete CI/CD pipeline with automated versioning ([5e9c325](https://github.com/aegisx-platform/aegisx-starter/commit/5e9c32539c8892c5d383f3d7ecb63516495100db))
- complete AegisX UI library quality improvements ([69f6ce4](https://github.com/aegisx-platform/aegisx-starter/commit/69f6ce4539817e8f51c72dd0d2d3ea614e3dfe8d))
- complete Angular dynamic ports integration with multi-instance system ([b5b66a6](https://github.com/aegisx-platform/aegisx-starter/commit/b5b66a6e013200c045e53457bad7e24b6b640541))
- complete multi-instance development system with Docker Compose instance files ([9319dec](https://github.com/aegisx-platform/aegisx-starter/commit/9319dec1b4c0d3082b0202ed9ea4ee9862b98cca))
- complete Phase 3.1 Backend Performance & Security audit ([ebb54c8](https://github.com/aegisx-platform/aegisx-starter/commit/ebb54c821c948744fc0061bc3ecfc4e36798723d))
- complete Settings API integration tests and fix response handler ([cceeb35](https://github.com/aegisx-platform/aegisx-starter/commit/cceeb35122dcc89e8ecb236b022480c65218014e))
- complete user profile management system ([dc5146a](https://github.com/aegisx-platform/aegisx-starter/commit/dc5146ad86fb9b9d43eb936f0e1bda8319da32c7))
- complete workflow overhaul with enterprise-grade improvements ([3671a97](https://github.com/aegisx-platform/aegisx-starter/commit/3671a973860810cca9b260b81a53100d8e50a866))
- comprehensive AegisX UI library linting fixes and development standards ([4e6df4d](https://github.com/aegisx-platform/aegisx-starter/commit/4e6df4d3b844b5b7d26d3b0fc1698774fb739766))
- enhance Angular app with UI improvements and authentication docs ([5e0ac2d](https://github.com/aegisx-platform/aegisx-starter/commit/5e0ac2d18ac1d6de8f1f2ff57e0fa71c6b95d7e1))
- enhance GitHub Actions Docker build with staging/production tag strategy ([b86b9aa](https://github.com/aegisx-platform/aegisx-starter/commit/b86b9aa23c172ea41d22527055c4861b7cb7368d))
- enhance UI components and E2E testing infrastructure ([c0531b1](https://github.com/aegisx-platform/aegisx-starter/commit/c0531b173a3403c1237414e059ec26af31a061bf))
- enhance universal standard with database-first approach and prevention checklist ([d0bc87f](https://github.com/aegisx-platform/aegisx-starter/commit/d0bc87f09fd2a83aa251ccc93f1e300958cfe556))
- enhance user profile management with comprehensive features ([8f454c4](https://github.com/aegisx-platform/aegisx-starter/commit/8f454c4306740f841e8e908180d007223e8ac932))
- implement @aegisx/ui library with correct structure ([21f6172](https://github.com/aegisx-platform/aegisx-starter/commit/21f61728b8d0f46d32049eec71a849f3bcc9573c))
- implement auto-release flow with immediate Docker builds ([0ffb858](https://github.com/aegisx-platform/aegisx-starter/commit/0ffb858ec4a8996df6728330a117939fc2eb03eb))
- implement avatar upload component with drag & drop functionality ([5fc6ba1](https://github.com/aegisx-platform/aegisx-starter/commit/5fc6ba1ed5f51a0d44275bdb4287c8147b6bbfc7))
- implement complete authentication system with QA standards ([4b3b7f3](https://github.com/aegisx-platform/aegisx-starter/commit/4b3b7f3d0ed31df3d1ac857eee2c97367ba47fe8))
- implement complete RBAC WebSocket real-time integration system ([4dd189d](https://github.com/aegisx-platform/aegisx-starter/commit/4dd189d17a5287cb2d1a8f3aabd29463da1c0408))
- implement complete Settings feature with frontend-backend integration ([d90b51c](https://github.com/aegisx-platform/aegisx-starter/commit/d90b51cb37694326d646b29c2e028fb54e615ebf))
- implement comprehensive component showcase with Material Design and AegisX UI components ([f0166eb](https://github.com/aegisx-platform/aegisx-starter/commit/f0166ebb2faa6f68bb630a7c8527ba4b11478d56))
- implement comprehensive Feature Development & Multi-Feature Management Standards ([5909c1f](https://github.com/aegisx-platform/aegisx-starter/commit/5909c1f36fee0e83924268288b27d5b210ef8365))
- implement comprehensive monitoring and logging system ([43bae61](https://github.com/aegisx-platform/aegisx-starter/commit/43bae61eb406c7f2038594870cf76761ad7461c3))
- implement comprehensive multi-instance development setup ([8237508](https://github.com/aegisx-platform/aegisx-starter/commit/82375081ebe57af69e7f677c8f3d8e8275e728d7))
- implement comprehensive user activity tracking system ([b443c70](https://github.com/aegisx-platform/aegisx-starter/commit/b443c700c6bb2321aa8851ce6d9fe110d72a8a1f))
- implement Features 1 & 2 with auth refactoring ([c9f716f](https://github.com/aegisx-platform/aegisx-starter/commit/c9f716f1b21c675303d8a65f834309730b7fa2a3))
- implement Features 1 & 2 with complete documentation ([09703dd](https://github.com/aegisx-platform/aegisx-starter/commit/09703dd3cf828a6c634097a5d43d016be219d550))
- implement NavigationService with API integration and fallback support ([ef126b9](https://github.com/aegisx-platform/aegisx-starter/commit/ef126b9b5f52d330c87bb057d1febfa8ab7cf57f))
- implement secure account deletion system ([dc76d99](https://github.com/aegisx-platform/aegisx-starter/commit/dc76d99b533ada3ffee36bec4427bd465cbab440))
- implement Settings API module with comprehensive testing workflow ([aa34692](https://github.com/aegisx-platform/aegisx-starter/commit/aa3469230933880b786b5329399ce72d93c057d4))
- implement user management API module with CRUD endpoints ([7667d3d](https://github.com/aegisx-platform/aegisx-starter/commit/7667d3db1ee2d4fc7960439ff54b89088e50a4c0))
- implement user profile management with direct save functionality ([aa31cf8](https://github.com/aegisx-platform/aegisx-starter/commit/aa31cf8772b0d1ba53174ad5c0c8bbad7341177b))
- improve authentication and user management systems ([bdef5eb](https://github.com/aegisx-platform/aegisx-starter/commit/bdef5eb957cb261028054792a278d98502875dc3))
- initialize component-showcase feature planning ([f13e0fb](https://github.com/aegisx-platform/aegisx-starter/commit/f13e0fb4d9a88a879e54c6f907d645d2fcc892f0))
- initialize user-profile feature planning ([eae5d48](https://github.com/aegisx-platform/aegisx-starter/commit/eae5d483287d851f9457508387220940634d4049))
- integrate component-showcase and protection system into main ([d14461b](https://github.com/aegisx-platform/aegisx-starter/commit/d14461ba44ba1bc738e3d31ed85545b9afa704b9))
- merge component-showcase feature ([35ce651](https://github.com/aegisx-platform/aegisx-starter/commit/35ce6511cbbb39bb02bbe6dfb8c17cd2c587f3ea))
- merge Settings API completion with infrastructure improvements ([842159c](https://github.com/aegisx-platform/aegisx-starter/commit/842159c8a1b05984a616376391dd121eed17492f))
- migrate all modules to TypeBox schemas with complete type safety ([1bfbfcf](https://github.com/aegisx-platform/aegisx-starter/commit/1bfbfcf9313c2053285e078ae487c461f0d06102))
- **navigation:** enhance navigation UI with improved styling and responsiveness ([f932821](https://github.com/aegisx-platform/aegisx-starter/commit/f9328214d02d2b6936fa93ea7fa0c8166967a0d7))
- optimize CI/CD workflow with parallel builds and enhanced monitoring ([07c0865](https://github.com/aegisx-platform/aegisx-starter/commit/07c086510a3071b07a543c493593e8bc427c835c))
- optimize Git hooks for better developer experience ([420855e](https://github.com/aegisx-platform/aegisx-starter/commit/420855e324a691026eb60bf2893e69255e27ede5))
- **protection:** add comprehensive semantic-release protection system ([6093313](https://github.com/aegisx-platform/aegisx-starter/commit/6093313accc3e9e540b3cb06b1033a8e1ea7fd8c))
- replace complex workflows with simple semantic-release approach ([99aece6](https://github.com/aegisx-platform/aegisx-starter/commit/99aece6aa19ff7ac881406b16df056687bbcc958))
- restore component-showcase and semantic-release protection system ([0a86157](https://github.com/aegisx-platform/aegisx-starter/commit/0a861579e6db192340ae81a5f5d9a8037bbaf9ef))
- **settings:** implement complete Settings feature with backend-frontend alignment ([4aa6cfc](https://github.com/aegisx-platform/aegisx-starter/commit/4aa6cfcb43ba330e62b01fb4c8dec67e2cf91db3))
- standardize API response schemas and fix user management ([b43bedb](https://github.com/aegisx-platform/aegisx-starter/commit/b43bedb79caddab092e391a0ba1aebab1cd81078))
- **users:** implement comprehensive bulk operations system ([8caa1a6](https://github.com/aegisx-platform/aegisx-starter/commit/8caa1a6a5fbf3eb149ad1447cdfa551e26cde66a))
- **web:** complete UI integration with @aegisx/ui library ([b0ee842](https://github.com/aegisx-platform/aegisx-starter/commit/b0ee842fc3bef9f070368d7617ee28785358ee76))
- **web:** implement comprehensive frontend features for Clone 2 ([68998d7](https://github.com/aegisx-platform/aegisx-starter/commit/68998d7008c8a0da67014426d0df0c070cc328ff))

### Performance Improvements

- enhance GitHub Actions workflow and Dockerfile integration ([c5045dd](https://github.com/aegisx-platform/aegisx-starter/commit/c5045dd9edb8f6ebb121e7b6651f4e24fe716610))
- major Docker build performance improvements ([3c5c3de](https://github.com/aegisx-platform/aegisx-starter/commit/3c5c3dee75d77485bcdd843257f7d4a29c9e662f))
- optimize CI/CD workflow for faster builds ([fc6efda](https://github.com/aegisx-platform/aegisx-starter/commit/fc6efda30648e93d56d400d56be50779fd9184a2))
- optimize git hooks for faster development workflow ([69ce54e](https://github.com/aegisx-platform/aegisx-starter/commit/69ce54e54b64ee687e16c663c8975fa1a014e490))
- reduce build timeouts for faster feedback ([fd99fec](https://github.com/aegisx-platform/aegisx-starter/commit/fd99fecbc5462bbb08d3e1739a6257b60a0e1aae))
- suppress yarn warnings to speed up Docker builds ([5cb5fa5](https://github.com/aegisx-platform/aegisx-starter/commit/5cb5fa5898880aad30100f9007abae91198bb6dd))

### BREAKING CHANGES

- pgAdmin no longer included in Docker setup, use external client if needed
- Complete CI/CD workflow transformation

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

- Complete workflow overhaul

* Remove complex ci-cd.yml (600+ lines) with change detection, matrix testing
* Replace with simple release.yml (162 lines) using semantic-release
* Support both main (release) and develop (staging) branches
* Build matrix for api, web, admin apps
* Multi-platform builds (linux/amd64, linux/arm64)
* Clear tagging strategy: latest + version for main, staging-\* for develop

Benefits:

- 75% reduction in workflow complexity
- Standard semantic-release versioning
- Faster builds without unnecessary tests
- Clear separation of staging vs production
- Maintainable and debuggable

* Workflows now use postgres/postgres for all database
  connections instead of mixed credentials

# [1.1.0](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.12...v1.1.0) (2025-09-15)

### Features

- integrate component-showcase and protection system into main ([7bac204](https://github.com/aegisx-platform/aegisx-starter/commit/7bac20414de1df0d58c77ae1889d3c7afd821d24))
- restore component-showcase and semantic-release protection system ([c2687d7](https://github.com/aegisx-platform/aegisx-starter/commit/c2687d7ae82f82a5e9e76576c32c2d3e6ca72614))

# [1.1.0](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.12...v1.1.0) (2025-09-15)

### Features

- integrate component-showcase and protection system into main ([7bac204](https://github.com/aegisx-platform/aegisx-starter/commit/7bac20414de1df0d58c77ae1889d3c7afd821d24))
- restore component-showcase and semantic-release protection system ([c2687d7](https://github.com/aegisx-platform/aegisx-starter/commit/c2687d7ae82f82a5e9e76576c32c2d3e6ca72614))

## [1.0.12](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.11...v1.0.12) (2025-09-15)

### Bug Fixes

- clean up v2.x.x releases and restore clean v1.0.11 state ([c852c58](https://github.com/aegisx-platform/aegisx-starter/commit/c852c5814b639549468ae432c6d9332767129d33))

# Changelog

## [1.0.11](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.10...v1.0.11) (2025-09-15)

### Features

- Complete user activity tracking and profile management system
- Multi-instance development environment with automatic port assignment
- Enhanced authentication with systematic token management
- Avatar upload and display functionality
- Settings management with backend-frontend integration

### Bug Fixes

- Resolve authentication and navigation optimization issues
- Fix multipart form data validation for avatar uploads
- Improve API endpoint integration and error handling

## [Unreleased]

### Features

- **auth**: Enhanced authentication system with systematic token management
  - Systematic token refresh with proactive refresh strategy
  - Enhanced auth interceptor with proper 401 handling and retry logic
  - Improved route guards with proper async state waiting
  - Added loading states using Angular Signals for better UX

- **multi-instance**: Add comprehensive multi-instance development setup
  - Folder-based automatic port assignment and container naming
  - Auto-generated .env.local and docker-compose.override.yml files
  - Port registry system with conflict detection
  - Instance management commands (list, stop, cleanup)
  - Complete isolation between development instances
  - Hash-based consistent port calculation
  - One-command setup workflow with `pnpm setup`

### Developer Experience

- **setup**: Add setup-env.sh script for automatic environment configuration
- **management**: Add port-manager.sh for instance lifecycle management
- **documentation**: Add comprehensive multi-instance development guide
- **git**: Auto-exclude generated files (.env.local, docker-compose.override.yml)
- **workflow**: Update package.json scripts for streamlined setup process

### Documentation

- **guides**: Add multi-instance setup guide with troubleshooting
- **reference**: Add quick command reference for multi-instance workflow
- **examples**: Add port assignment examples and usage patterns

## [1.0.10](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.9...v1.0.10) (2025-09-12)

### Bug Fixes

- force complete Docker cache clear to resolve nginx validation issues ([34cf95e](https://github.com/aegisx-platform/aegisx-starter/commit/34cf95e9d000d51b33a4af0723f986326c673a00))

## [1.0.9](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.8...v1.0.9) (2025-09-12)

### Bug Fixes

- remove github workflow ([5bc00a4](https://github.com/aegisx-platform/aegisx-starter/commit/5bc00a47ab3d6ecc43598c7570f78f621d310df7))

## [1.0.8](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.7...v1.0.8) (2025-09-12)

### Bug Fixes

- remove must-revalidate from ssl setup script nginx config template ([d39f422](https://github.com/aegisx-platform/aegisx-starter/commit/d39f4220cbc3bfa1b702334ecb86e98f9aef9fca))

## [1.0.7](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.6...v1.0.7) (2025-09-12)

### Bug Fixes

- force nginx config refresh with content changes ([c20891c](https://github.com/aegisx-platform/aegisx-starter/commit/c20891c45f0083b7f40b96b94ffbdd3e99f480d0))

## [1.0.6](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.5...v1.0.6) (2025-09-12)

### Bug Fixes

- remove must-revalidate from Cache-Control headers in nginx configs ([54d94f4](https://github.com/aegisx-platform/aegisx-starter/commit/54d94f4ff081bfc64e03fbd0b113edfad9fbd6a2))

## [1.0.5](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.4...v1.0.5) (2025-09-12)

### Bug Fixes

- **dockerfile:** add space ([1067e61](https://github.com/aegisx-platform/aegisx-starter/commit/1067e611f5d713245e11125566227821c4a2d419))

## [1.0.4](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.3...v1.0.4) (2025-09-12)

### Bug Fixes

- force nginx config refresh for Docker builds ([041d383](https://github.com/aegisx-platform/aegisx-starter/commit/041d3838184c9d40998f737b0fce7250b1430073))

## [1.0.3](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.2...v1.0.3) (2025-09-12)

### Bug Fixes

- force Docker image pulls and ensure clean nginx configs ([7056b6d](https://github.com/aegisx-platform/aegisx-starter/commit/7056b6d553598209d9344f18c1aea7ad33607bad))

## [1.0.2](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.1...v1.0.2) (2025-09-12)

### Bug Fixes

- add no-cache flag to all Docker builds to force fresh nginx configs ([ab6bf56](https://github.com/aegisx-platform/aegisx-starter/commit/ab6bf56246cd32d757f481045cf9a22a928a1200))
- resolve nginx configuration errors and update to pnpm ([7717b13](https://github.com/aegisx-platform/aegisx-starter/commit/7717b139c7770bc91101914c5542a5ea50b1a50f))

## [1.0.1](https://github.com/aegisx-platform/aegisx-starter/compare/v1.0.0...v1.0.1) (2025-09-12)

### Bug Fixes

- remove invalid must-revalidate from nginx gzip_proxied directive ([afc433b](https://github.com/aegisx-platform/aegisx-starter/commit/afc433b796e450d02a3498a495d220851615f4fd))

# 1.0.0 (2025-09-12)

### Bug Fixes

- add /api prefix to user management routes ([d2bca32](https://github.com/aegisx-platform/aegisx-starter/commit/d2bca32d4051945c468dfb923624330382c0e09d))
- add reflect-metadata import for tsyringe dependency injection ([9e4a899](https://github.com/aegisx-platform/aegisx-starter/commit/9e4a8996a6f411682c4b3b2fe8da60fa265dbdba))
- remove tsyringe dependency injection from users module ([d975e6d](https://github.com/aegisx-platform/aegisx-starter/commit/d975e6d0639af0fdf93d3cf8c3c78d7cd619888f))
- resolve CORS, monitoring endpoints, and user creation issues ([6b82c68](https://github.com/aegisx-platform/aegisx-starter/commit/6b82c6873468254f838affb4bfcdee2ae7752249))
- standardize API response schemas and fix user management ([1126a8c](https://github.com/aegisx-platform/aegisx-starter/commit/1126a8c3a2ecfa6b8192fd9adb06d5b0336b8a4f))
