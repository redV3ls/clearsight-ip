import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { Env } from '../../../index';
import {
  UserProfileUpdateSchema,
  UserPreferencesSchema,
  UserSkillEntrySchema,
  UserExperienceSchema,
  UserEducationSchema,
  UserSearchSchema,
  UserProfileResponseSchema,
  UserListResponseSchema,
  UserSkillsResponseSchema,
  UserExperienceResponseSchema,
  UserEducationResponseSchema,
  UserActivityResponseSchema
} from '../schemas/users';
import { ErrorResponseSchema } from '../schemas/common';

/**
 * Users Route Documentation
 * 
 * OpenAPI documentation for user management endpoints.
 * Includes profile management, skills, experience, and education.
 */

export function usersRoutes(app: OpenAPIHono<{ Bindings: Env }>) {
  
  // GET /users/profile
  const getUserProfileRoute = createRoute({
    method: 'get',
    path: '/api/v1/users/profile',
    tags: ['Users'],
    summary: 'Get user profile',
    description: 'Retrieve complete user profile including skills, experience, and education.',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'User profile retrieved successfully',
        content: {
          'application/json': {
            schema: UserProfileResponseSchema
          }
        }
      },
      401: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      }
    }
  });

  // PUT /users/profile
  const updateUserProfileRoute = createRoute({
    method: 'put',
    path: '/api/v1/users/profile',
    tags: ['Users'],
    summary: 'Update user profile',
    description: 'Update user profile information.',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: UserProfileUpdateSchema
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Profile updated successfully',
        content: {
          'application/json': {
            schema: UserProfileResponseSchema
          }
        }
      },
      400: {
        description: 'Invalid request data',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      },
      401: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      }
    }
  });

  // GET /users/skills
  const getUserSkillsRoute = createRoute({
    method: 'get',
    path: '/api/v1/users/skills',
    tags: ['Users'],
    summary: 'Get user skills',
    description: 'Retrieve user\'s skills with categories and statistics.',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'User skills retrieved successfully',
        content: {
          'application/json': {
            schema: UserSkillsResponseSchema
          }
        }
      },
      401: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      }
    }
  });

  // POST /users/skills
  const addUserSkillRoute = createRoute({
    method: 'post',
    path: '/api/v1/users/skills',
    tags: ['Users'],
    summary: 'Add user skill',
    description: 'Add a new skill to user\'s profile.',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: UserSkillEntrySchema
          }
        }
      }
    },
    responses: {
      201: {
        description: 'Skill added successfully',
        content: {
          'application/json': {
            schema: UserSkillsResponseSchema
          }
        }
      },
      400: {
        description: 'Invalid skill data',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      },
      401: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      }
    }
  });

  // GET /users/experience
  const getUserExperienceRoute = createRoute({
    method: 'get',
    path: '/api/v1/users/experience',
    tags: ['Users'],
    summary: 'Get user experience',
    description: 'Retrieve user\'s work experience with statistics.',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'User experience retrieved successfully',
        content: {
          'application/json': {
            schema: UserExperienceResponseSchema
          }
        }
      },
      401: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      }
    }
  });

  // POST /users/experience
  const addUserExperienceRoute = createRoute({
    method: 'post',
    path: '/api/v1/users/experience',
    tags: ['Users'],
    summary: 'Add work experience',
    description: 'Add new work experience to user\'s profile.',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: UserExperienceSchema
          }
        }
      }
    },
    responses: {
      201: {
        description: 'Experience added successfully',
        content: {
          'application/json': {
            schema: UserExperienceResponseSchema
          }
        }
      },
      400: {
        description: 'Invalid experience data',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      },
      401: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      }
    }
  });

  // GET /users/activity
  const getUserActivityRoute = createRoute({
    method: 'get',
    path: '/api/v1/users/activity',
    tags: ['Users'],
    summary: 'Get user activity',
    description: 'Retrieve user\'s activity history with pagination.',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'User activity retrieved successfully',
        content: {
          'application/json': {
            schema: UserActivityResponseSchema
          }
        }
      },
      401: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: ErrorResponseSchema
          }
        }
      }
    }
  });

  // Register routes for documentation
  app.openapi(getUserProfileRoute, (c) => c.json({ message: 'Get user profile endpoint' }));
  app.openapi(updateUserProfileRoute, (c) => c.json({ message: 'Update user profile endpoint' }));
  app.openapi(getUserSkillsRoute, (c) => c.json({ message: 'Get user skills endpoint' }));
  app.openapi(addUserSkillRoute, (c) => c.json({ message: 'Add user skill endpoint' }));
  app.openapi(getUserExperienceRoute, (c) => c.json({ message: 'Get user experience endpoint' }));
  app.openapi(addUserExperienceRoute, (c) => c.json({ message: 'Add user experience endpoint' }));
  app.openapi(getUserActivityRoute, (c) => c.json({ message: 'Get user activity endpoint' }));
}