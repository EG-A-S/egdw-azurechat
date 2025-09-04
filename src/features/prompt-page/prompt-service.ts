"use server";

import {
  ServerActionResponse,
  zodErrorsToServerActionErrors,
} from "@/features/common/server-action-response";
import {
  PROMPT_ATTRIBUTE,
  PromptModel,
  PromptModelSchema,
} from "@/features/prompt-page/models";
import { SqlQuerySpec } from "@azure/cosmos";
import { getCurrentUser, userHashedId, userEmail } from "../auth-page/helpers";
import { ConfigContainer } from "../common/services/cosmos";
import { uniqueId } from "../common/util";

export const CreatePrompt = async (
  props: PromptModel
): Promise<ServerActionResponse<PromptModel>> => {
  try {
    const user = await getCurrentUser();

    const modelToSave: PromptModel = {
      id: uniqueId(),
      name: props.name,
      description: props.description,
      isPublished: props.isPublished,
      userId: await userHashedId(),
      sharedWith: [],
      createdAt: new Date(),
      type: "PROMPT",
    };

    const valid = ValidateSchema(modelToSave);

    if (valid.status !== "OK") {
      return valid;
    }

    const { resource } = await ConfigContainer().items.create<PromptModel>(
      modelToSave
    );

    if (resource) {
      return {
        status: "OK",
        response: resource,
      };
    } else {
      return {
        status: "ERROR",
        errors: [
          {
            message: "Error creating prompt",
          },
        ],
      };
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error creating prompt: ${error}`,
        },
      ],
    };
  }
};

export const FindAllPrompts = async (): Promise<
  ServerActionResponse<Array<PromptModel>>
> => {
  try {
    const user = await getCurrentUser();
    const currentUserEmail = await userEmail();
    const currentUserId = await userHashedId();
    
    const querySpec: SqlQuerySpec = user.isAdmin 
      ? {
          query: "SELECT * FROM root r WHERE r.type=@type",
          parameters: [
            {
              name: "@type",
              value: PROMPT_ATTRIBUTE,
            },
          ],
        }
      : {
          query: "SELECT * FROM root r WHERE r.type=@type AND (r.userId=@userId OR (ARRAY_CONTAINS(r.sharedWith, @userEmail) AND r.isPublished=@isPublished))",
          parameters: [
            {
              name: "@type",
              value: PROMPT_ATTRIBUTE,
            },
            {
              name: "@userId",
              value: currentUserId,
            },
            {
              name: "@userEmail",
              value: currentUserEmail,
            },
            {
              name: "@isPublished",
              value: true,
            },
          ],
        };

    const { resources } = await ConfigContainer()
      .items.query<PromptModel>(querySpec)
      .fetchAll();

    return {
      status: "OK",
      response: resources,
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error retrieving prompt: ${error}`,
        },
      ],
    };
  }
};

export const EnsurePromptOperation = async (
  promptId: string
): Promise<ServerActionResponse<PromptModel>> => {
  const promptResponse = await FindPromptByID(promptId);
  const currentUser = await getCurrentUser();
  const currentUserId = await userHashedId();

  if (promptResponse.status === "OK") {
    const prompt = promptResponse.response;
    if (currentUser.isAdmin || prompt.userId === currentUserId) {
      return promptResponse;
    }
  }

  return {
    status: "UNAUTHORIZED",
    errors: [
      {
        message: `Prompt not found with id: ${promptId}`,
      },
    ],
  };
};

export const DeletePrompt = async (
  promptId: string
): Promise<ServerActionResponse<PromptModel>> => {
  try {
    const promptResponse = await EnsurePromptOperation(promptId);

    if (promptResponse.status === "OK") {
      const { resource: deletedPrompt } = await ConfigContainer()
        .item(promptId, promptResponse.response.userId)
        .delete();

      return {
        status: "OK",
        response: deletedPrompt,
      };
    }

    return promptResponse;
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error deleting prompt: ${error}`,
        },
      ],
    };
  }
};

export const FindPromptByID = async (
  id: string
): Promise<ServerActionResponse<PromptModel>> => {
  try {
    const querySpec: SqlQuerySpec = {
      query: "SELECT * FROM root r WHERE r.type=@type AND r.id=@id",
      parameters: [
        {
          name: "@type",
          value: PROMPT_ATTRIBUTE,
        },
        {
          name: "@id",
          value: id,
        },
      ],
    };

    const { resources } = await ConfigContainer()
      .items.query<PromptModel>(querySpec)
      .fetchAll();

    if (resources.length === 0) {
      return {
        status: "NOT_FOUND",
        errors: [
          {
            message: "Prompt not found",
          },
        ],
      };
    }

    return {
      status: "OK",
      response: resources[0],
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error finding prompt: ${error}`,
        },
      ],
    };
  }
};

export const UpsertPrompt = async (
  promptInput: PromptModel
): Promise<ServerActionResponse<PromptModel>> => {
  try {
    const promptResponse = await EnsurePromptOperation(promptInput.id);

    if (promptResponse.status === "OK") {
      const { response: prompt } = promptResponse;
      const user = await getCurrentUser();

      const modelToUpdate: PromptModel = {
        ...prompt,
        name: promptInput.name,
        description: promptInput.description,
        isPublished: promptInput.isPublished,
        createdAt: new Date(),
      };

      const validationResponse = ValidateSchema(modelToUpdate);
      if (validationResponse.status !== "OK") {
        return validationResponse;
      }

      const { resource } = await ConfigContainer().items.upsert<PromptModel>(
        modelToUpdate
      );

      if (resource) {
        return {
          status: "OK",
          response: resource,
        };
      }

      return {
        status: "ERROR",
        errors: [
          {
            message: "Error updating prompt",
          },
        ],
      };
    }

    return promptResponse;
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error updating prompt: ${error}`,
        },
      ],
    };
  }
};

export const SharePrompt = async (
  promptId: string,
  targetEmails: string[]
): Promise<ServerActionResponse<PromptModel>> => {
  try {
    const promptResponse = await FindPromptByID(promptId);
    const currentUserId = await userHashedId();

    if (promptResponse.status !== "OK") {
      return promptResponse;
    }

    const prompt = promptResponse.response;

    if (prompt.userId !== currentUserId) {
      return {
        status: "UNAUTHORIZED",
        errors: [
          {
            message: "Only the owner can share this prompt",
          },
        ],
      };
    }

    if (!prompt.isPublished) {
      return {
        status: "ERROR",
        errors: [
          {
            message: "Only published prompts can be shared",
          },
        ],
      };
    }

    const emailRegex = /^[a-zA-Z0-9]{5}@eg\./;
    const validEmails = targetEmails.filter(email => 
      emailRegex.test(email.trim())
    );

    if (validEmails.length === 0) {
      return {
        status: "ERROR",
        errors: [
          {
            message: "Please provide valid email addresses (xxxxx@eg.)",
          },
        ],
      };
    }

    const updatedSharedWith = Array.from(new Set([...prompt.sharedWith, ...validEmails]));

    const updatedPrompt: PromptModel = {
      ...prompt,
      sharedWith: updatedSharedWith,
    };

    const validationResponse = ValidateSchema(updatedPrompt);
    if (validationResponse.status !== "OK") {
      return validationResponse;
    }

    const { resource } = await ConfigContainer().items.upsert<PromptModel>(
      updatedPrompt
    );

    if (resource) {
      return {
        status: "OK",
        response: resource,
      };
    }

    return {
      status: "ERROR",
      errors: [
        {
          message: "Error sharing prompt",
        },
      ],
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error sharing prompt: ${error}`,
        },
      ],
    };
  }
};

export const DuplicatePrompt = async (
  promptId: string
): Promise<ServerActionResponse<PromptModel>> => {
  try {
    const promptResponse = await FindPromptByID(promptId);
    const currentUserEmail = await userEmail();
    const currentUserId = await userHashedId();

    if (promptResponse.status !== "OK") {
      return promptResponse;
    }

    const originalPrompt = promptResponse.response;

    if (originalPrompt.userId === currentUserId) {
      return {
        status: "ERROR",
        errors: [
          {
            message: "Cannot duplicate your own prompt",
          },
        ],
      };
    }

    if (!originalPrompt.sharedWith.includes(currentUserEmail)) {
      return {
        status: "UNAUTHORIZED",
        errors: [
          {
            message: "Prompt is not shared with you",
          },
        ],
      };
    }

    const duplicatedPrompt: PromptModel = {
      id: uniqueId(),
      name: `${originalPrompt.name} (Copy)`,
      description: originalPrompt.description,
      isPublished: false,
      userId: currentUserId,
      sharedWith: [],
      createdAt: new Date(),
      type: "PROMPT",
    };

    const validationResponse = ValidateSchema(duplicatedPrompt);
    if (validationResponse.status !== "OK") {
      return validationResponse;
    }

    const { resource } = await ConfigContainer().items.create<PromptModel>(
      duplicatedPrompt
    );

    if (resource) {
      return {
        status: "OK",
        response: resource,
      };
    }

    return {
      status: "ERROR",
      errors: [
        {
          message: "Error duplicating prompt",
        },
      ],
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error duplicating prompt: ${error}`,
        },
      ],
    };
  }
};

const ValidateSchema = (model: PromptModel): ServerActionResponse => {
  const validatedFields = PromptModelSchema.safeParse(model);

  if (!validatedFields.success) {
    return {
      status: "ERROR",
      errors: zodErrorsToServerActionErrors(validatedFields.error.errors),
    };
  }

  return {
    status: "OK",
    response: model,
  };
};

export const FindPublishedPrompts = async (): Promise<
  ServerActionResponse<Array<PromptModel>>
> => {
  try {
    const user = await getCurrentUser();
    const currentUserEmail = await userEmail();
    const currentUserId = await userHashedId();
    
    const querySpec: SqlQuerySpec = user.isAdmin 
      ? {
          query: "SELECT * FROM root r WHERE r.type=@type AND r.isPublished=@isPublished",
          parameters: [
            {
              name: "@type",
              value: PROMPT_ATTRIBUTE,
            },
            {
              name: "@isPublished",
              value: true,
            },
          ],
        }
      : {
          query: "SELECT * FROM root r WHERE r.type=@type AND r.isPublished=@isPublished AND (r.userId=@userId OR ARRAY_CONTAINS(r.sharedWith, @userEmail))",
          parameters: [
            {
              name: "@type",
              value: PROMPT_ATTRIBUTE,
            },
            {
              name: "@isPublished",
              value: true,
            },
            {
              name: "@userId",
              value: currentUserId,
            },
            {
              name: "@userEmail",
              value: currentUserEmail,
            },
          ],
        };

    const { resources } = await ConfigContainer()
      .items.query<PromptModel>(querySpec)
      .fetchAll();

    return {
      status: "OK",
      response: resources,
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error retrieving published prompts: ${error}`,
        },
      ],
    };
  }
};
