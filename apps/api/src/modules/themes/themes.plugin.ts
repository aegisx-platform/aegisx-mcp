import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { ThemesController } from './themes.controller';
import { ThemesService } from './themes.service';
import { themesRoutes } from './themes.routes';

export interface ThemesPluginOptions {
  // Plugin configuration options
}

async function themesPlugin(
  fastify: FastifyInstance,
  opts: ThemesPluginOptions
) {
  // Register dependencies
  const themesService = new ThemesService();
  const themesController = new ThemesController(themesService);

  // Register routes
  await fastify.register(themesRoutes, {
    controller: themesController,
    prefix: '/themes'
  });


  fastify.log.info('Themes plugin registered successfully');
}

export default fp(themesPlugin, {
  name: 'themes-plugin',
  dependencies: []
});