import Router from '@koa/router';
import configRoutes from './config';
import servicesRoutes from './service';
import themeRoutes from './theme';
import healthzRoutes from './healthz';

const apiRouter = new Router({ prefix: '/api' });

apiRouter.use(
  configRoutes.routes(),
  servicesRoutes.routes(),
  themeRoutes.routes(),
  healthzRoutes.routes(),
);

export default apiRouter;
