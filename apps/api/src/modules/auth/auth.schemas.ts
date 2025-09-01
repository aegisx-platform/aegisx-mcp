export const authSchemas = {
  // Entity schemas
  user: {
    $id: 'authUser',
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email' },
      username: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      isActive: { type: 'boolean' },
      role: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    },
    required: ['id', 'email', 'username', 'firstName', 'lastName', 'isActive', 'role']
  },

  // Request schemas
  registerRequest: {
    $id: 'registerRequest',
    type: 'object',
    properties: {
      email: { 
        type: 'string', 
        format: 'email',
        description: 'User email address'
      },
      username: { 
        type: 'string', 
        minLength: 3, 
        maxLength: 50,
        pattern: '^[a-zA-Z0-9_-]+$',
        description: 'Username (alphanumeric, underscore, hyphen only)'
      },
      password: { 
        type: 'string', 
        minLength: 8,
        description: 'Password (minimum 8 characters)'
      },
      firstName: { 
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: 'First name'
      },
      lastName: { 
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: 'Last name'
      }
    },
    required: ['email', 'username', 'password', 'firstName', 'lastName'],
    additionalProperties: false
  },

  loginRequest: {
    $id: 'loginRequest',
    type: 'object',
    properties: {
      email: { 
        type: 'string', 
        format: 'email',
        description: 'User email address'
      },
      password: { 
        type: 'string',
        description: 'User password'
      }
    },
    required: ['email', 'password'],
    additionalProperties: false
  },

  refreshRequest: {
    $id: 'refreshRequest',
    type: 'object',
    properties: {
      refreshToken: { 
        type: 'string',
        description: 'Refresh token (optional if sent via cookie)'
      }
    },
    additionalProperties: false
  },

  // Response schemas
  authResponse: {
    $id: 'authResponse',
    type: 'object',
    properties: {
      success: { type: 'boolean', const: true },
      data: {
        type: 'object',
        properties: {
          user: { $ref: 'authUser#' },
          accessToken: { type: 'string' }
        },
        required: ['user', 'accessToken']
      },
      message: { type: 'string' }
    },
    required: ['success', 'data'],
    additionalProperties: false
  },

  registerResponse: {
    $id: 'registerResponse',
    type: 'object',
    properties: {
      success: { type: 'boolean', const: true },
      data: { $ref: 'authUser#' },
      message: { type: 'string' }
    },
    required: ['success', 'data'],
    additionalProperties: false
  },

  refreshResponse: {
    $id: 'refreshResponse',
    type: 'object',
    properties: {
      success: { type: 'boolean', const: true },
      data: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' }
        },
        required: ['accessToken']
      },
      message: { type: 'string' }
    },
    required: ['success', 'data'],
    additionalProperties: false
  },

  profileResponse: {
    $id: 'profileResponse',
    type: 'object',
    properties: {
      success: { type: 'boolean', const: true },
      data: { $ref: 'authUser#' },
      message: { type: 'string' }
    },
    required: ['success', 'data'],
    additionalProperties: false
  },

  logoutResponse: {
    $id: 'logoutResponse',
    type: 'object',
    properties: {
      success: { type: 'boolean', const: true },
      message: { type: 'string' }
    },
    required: ['success', 'message'],
    additionalProperties: false
  }
};

// Export schemas for registration
export function registerAuthSchemas(fastify: any) {
  for (const [key, schema] of Object.entries(authSchemas)) {
    fastify.addSchema(schema);
  }
}