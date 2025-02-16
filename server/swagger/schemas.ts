
export const schemas = {
  "CapacityUnit": {
    "type": "string",
    "enum": [
      "TONNES",
      "METRES_CUBED",
      "KILOGRAMS",
      "LITRES",
      "KVA"
    ]
  },
  "EquipmentCategory": {
    "type": "string",
    "enum": [
      "TRAILER",
      "CRANE",
      "EXCAVATOR",
      "DOZER",
      "WEIGH_BRIDGE",
      "TELEMATICS_DEVICE",
      "VEHICLE",
      "CRUSHER",
      "MILL",
      "LOADER",
      "GENERATOR"
    ]
  },
  "AnswerType": {
    "type": "string",
    "enum": [
      "TEXT",
      "BOOLEAN",
      "CHOICE",
      "FILE_UPLOAD"
    ]
  },
  "ExecutionStatus": {
    "type": "string",
    "enum": [
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED"
    ]
  },
  "JobPriority": {
    "type": "string",
    "enum": [
      "HIGH",
      "MEDIUM",
      "LOW"
    ]
  },
  "JobStatus": {
    "type": "string",
    "enum": [
      "PENDING",
      "PLANNED",
      "BLOCKED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED"
    ]
  },
  "JobType": {
    "type": "string",
    "enum": [
      "COLLECT_INTERNAL_SANDS",
      "COLLECT_EXTERNAL_SANDS",
      "COLLECT_INTERNAL_ORES",
      "COLLECT_EXTERNAL_ORES"
    ]
  },
  "Permission": {
    "type": "string",
    "enum": [
      "CREATE_USER",
      "READ_USER",
      "UPDATE_USER",
      "DELETE_USER",
      "CREATE_CLIENT",
      "READ_CLIENT",
      "UPDATE_CLIENT",
      "DELETE_CLIENT",
      "MANAGE_ROLES",
      "CREATE_JOB",
      "READ_JOB",
      "UPDATE_JOB",
      "DELETE_JOB",
      "CREATE_MAINTENANCE",
      "READ_MAINTENANCE",
      "UPDATE_MAINTENANCE",
      "DELETE_MAINTENANCE",
      "VIEW_ASSIGNMENTS",
      "CREATE_ASSIGNMENT",
      "READ_ASSIGNMENT",
      "UPDATE_ASSIGNMENT",
      "DELETE_ASSIGNMENT",
      "CREATE_EQUIPMENT",
      "READ_EQUIPMENT",
      "UPDATE_EQUIPMENT",
      "DELETE_EQUIPMENT"
    ]
  },
  "ProcedureType": {
    "type": "string",
    "enum": [
      "STANDARD",
      "START_OF_DAY",
      "END_OF_DAY",
      "EXCEPTION"
    ]
  },
  "QuestionType": {
    "type": "string",
    "enum": [
      "TEXT",
      "BOOLEAN",
      "CHOICE",
      "FILE_UPLOAD"
    ]
  },
  "Role": {
    "type": "string",
    "enum": [
      "ADMINISTRATOR",
      "TRANSPORT_MANAGER",
      "AGENT",
      "DRIVER",
      "CLIENT_MANAGER",
      "WORKSHOP_MANAGER"
    ]
  },
  "SiteClassification": {
    "type": "string",
    "enum": [
      "GREEN",
      "ORANGE",
      "RED"
    ]
  },
  "EquipmentStatus": {
    "type": "string",
    "enum": [
      "AVAILABLE",
      "IN_TRANSIT",
      "IN_USE",
      "UNDER_MAINTENANCE",
      "OUT_OF_SERVICE"
    ]
  },
  "ClientStatus": {
    "type": "string",
    "enum": [
      "ACTIVE",
      "INACTIVE"
    ]
  },
  "PlanStatus": {
    "type": "string",
    "enum": [
      "DRAFT",
      "PUBLISHED",
      "COMPLETED",
      "CANCELLED"
    ]
  },
  "Area": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "name": {
        "type": "string"
      },
      "site": {
        "$ref": "#/components/schemas/Site",
        "nullable": true
      },
      "siteId": {
        "type": "string"
      },
      "shafts": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Shaft"
        },
        "nullable": true
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      },
      "updatedAt": {
        "$ref": "#/components/schemas/Date"
      }
    }
  },
  "Client": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "firstName": {
        "type": "string"
      },
      "lastName": {
        "type": "string"
      },
      "idNumber": {
        "type": "string"
      },
      "address": {
        "type": "string"
      },
      "contactNumber": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "whatsapp": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "potentialContactNumbers": {
        "type": "boolean"
      },
      "email": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      },
      "updatedAt": {
        "$ref": "#/components/schemas/Date"
      },
      "shafts": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Shaft"
        },
        "nullable": true
      },
      "syndicates": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Syndicate"
        },
        "nullable": true
      },
      "Job": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Job"
        },
        "nullable": true
      },
      "status": {
        "type": "string",
        "enum": [
          "ACTIVE",
          "INACTIVE"
        ]
      }
    }
  },
  "Exception": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "execution": {
        "$ref": "#/components/schemas/Execution",
        "nullable": true
      },
      "executionId": {
        "type": "string"
      },
      "description": {
        "type": "string"
      },
      "evidence": {
        "$ref": "#/components/schemas/JsonValue"
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      },
      "updatedAt": {
        "$ref": "#/components/schemas/Date"
      }
    }
  },
  "Execution": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "procedure": {
        "$ref": "#/components/schemas/Procedure",
        "nullable": true
      },
      "procedureId": {
        "type": "string"
      },
      "user": {
        "$ref": "#/components/schemas/User",
        "nullable": true
      },
      "userId": {
        "type": "string"
      },
      "responses": {
        "$ref": "#/components/schemas/JsonValue"
      },
      "status": {
        "type": "string",
        "enum": [
          "IN_PROGRESS",
          "COMPLETED",
          "CANCELLED"
        ]
      },
      "startTime": {
        "$ref": "#/components/schemas/Date"
      },
      "exceptions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Exception"
        },
        "nullable": true
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      },
      "updatedAt": {
        "$ref": "#/components/schemas/Date"
      }
    }
  },
  "Job": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "title": {
        "type": "string"
      },
      "description": {
        "type": "string"
      },
      "priority": {
        "type": "string",
        "enum": [
          "HIGH",
          "MEDIUM",
          "LOW"
        ]
      },
      "siteClassification": {
        "type": "string",
        "enum": [
          "GREEN",
          "ORANGE",
          "RED"
        ]
      },
      "status": {
        "type": "string",
        "enum": [
          "PENDING",
          "PLANNED",
          "BLOCKED",
          "IN_PROGRESS",
          "COMPLETED",
          "CANCELLED"
        ]
      },
      "attachments": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/JobAttachment"
        },
        "nullable": true
      },
      "comments": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/JobComment"
        },
        "nullable": true
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      },
      "updatedAt": {
        "$ref": "#/components/schemas/Date"
      },
      "shaft": {
        "$ref": "#/components/schemas/Shaft",
        "nullable": true
      },
      "shaftId": {
        "type": "string"
      },
      "client": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "firstName": {
            "type": "string"
          },
          "lastName": {
            "type": "string"
          },
          "idNumber": {
            "type": "string"
          },
          "address": {
            "type": "string"
          },
          "contactNumber": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "whatsapp": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "potentialContactNumbers": {
            "type": "boolean"
          },
          "email": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "createdAt": {
            "$ref": "#/components/schemas/Date"
          },
          "updatedAt": {
            "$ref": "#/components/schemas/Date"
          },
          "shafts": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Shaft"
            },
            "nullable": true
          },
          "syndicates": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Syndicate"
            },
            "nullable": true
          },
          "Job": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Job"
            },
            "nullable": true
          },
          "status": {
            "type": "string",
            "enum": [
              "ACTIVE",
              "INACTIVE"
            ]
          }
        },
        "nullable": true
      },
      "clientId": {
        "type": "string"
      },
      "planAssignment": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/PlanAssignment"
        },
        "nullable": true
      }
    }
  },
  "JobAttachment": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "job": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "title": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "priority": {
            "type": "string",
            "enum": [
              "HIGH",
              "MEDIUM",
              "LOW"
            ]
          },
          "siteClassification": {
            "type": "string",
            "enum": [
              "GREEN",
              "ORANGE",
              "RED"
            ]
          },
          "status": {
            "type": "string",
            "enum": [
              "PENDING",
              "PLANNED",
              "BLOCKED",
              "IN_PROGRESS",
              "COMPLETED",
              "CANCELLED"
            ]
          },
          "attachments": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/JobAttachment"
            },
            "nullable": true
          },
          "comments": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/JobComment"
            },
            "nullable": true
          },
          "createdAt": {
            "$ref": "#/components/schemas/Date"
          },
          "updatedAt": {
            "$ref": "#/components/schemas/Date"
          },
          "shaft": {
            "$ref": "#/components/schemas/Shaft",
            "nullable": true
          },
          "shaftId": {
            "type": "string"
          },
          "client": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "firstName": {
                "type": "string"
              },
              "lastName": {
                "type": "string"
              },
              "idNumber": {
                "type": "string"
              },
              "address": {
                "type": "string"
              },
              "contactNumber": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "whatsapp": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "potentialContactNumbers": {
                "type": "boolean"
              },
              "email": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "createdAt": {
                "$ref": "#/components/schemas/Date"
              },
              "updatedAt": {
                "$ref": "#/components/schemas/Date"
              },
              "shafts": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Shaft"
                },
                "nullable": true
              },
              "syndicates": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Syndicate"
                },
                "nullable": true
              },
              "Job": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Job"
                },
                "nullable": true
              },
              "status": {
                "type": "string",
                "enum": [
                  "ACTIVE",
                  "INACTIVE"
                ]
              }
            },
            "nullable": true
          },
          "clientId": {
            "type": "string"
          },
          "planAssignment": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/PlanAssignment"
            },
            "nullable": true
          }
        },
        "nullable": true
      },
      "jobId": {
        "type": "string"
      },
      "fileUrl": {
        "type": "string"
      },
      "fileType": {
        "type": "string"
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      },
      "updatedAt": {
        "$ref": "#/components/schemas/Date"
      }
    }
  },
  "JobComment": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "job": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "title": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "priority": {
            "type": "string",
            "enum": [
              "HIGH",
              "MEDIUM",
              "LOW"
            ]
          },
          "siteClassification": {
            "type": "string",
            "enum": [
              "GREEN",
              "ORANGE",
              "RED"
            ]
          },
          "status": {
            "type": "string",
            "enum": [
              "PENDING",
              "PLANNED",
              "BLOCKED",
              "IN_PROGRESS",
              "COMPLETED",
              "CANCELLED"
            ]
          },
          "attachments": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/JobAttachment"
            },
            "nullable": true
          },
          "comments": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/JobComment"
            },
            "nullable": true
          },
          "createdAt": {
            "$ref": "#/components/schemas/Date"
          },
          "updatedAt": {
            "$ref": "#/components/schemas/Date"
          },
          "shaft": {
            "$ref": "#/components/schemas/Shaft",
            "nullable": true
          },
          "shaftId": {
            "type": "string"
          },
          "client": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "firstName": {
                "type": "string"
              },
              "lastName": {
                "type": "string"
              },
              "idNumber": {
                "type": "string"
              },
              "address": {
                "type": "string"
              },
              "contactNumber": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "whatsapp": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "potentialContactNumbers": {
                "type": "boolean"
              },
              "email": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "createdAt": {
                "$ref": "#/components/schemas/Date"
              },
              "updatedAt": {
                "$ref": "#/components/schemas/Date"
              },
              "shafts": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Shaft"
                },
                "nullable": true
              },
              "syndicates": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Syndicate"
                },
                "nullable": true
              },
              "Job": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Job"
                },
                "nullable": true
              },
              "status": {
                "type": "string",
                "enum": [
                  "ACTIVE",
                  "INACTIVE"
                ]
              }
            },
            "nullable": true
          },
          "clientId": {
            "type": "string"
          },
          "planAssignment": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/PlanAssignment"
            },
            "nullable": true
          }
        },
        "nullable": true
      },
      "jobId": {
        "type": "string"
      },
      "author": {
        "$ref": "#/components/schemas/User",
        "nullable": true
      },
      "authorId": {
        "type": "string"
      },
      "content": {
        "type": "string"
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      },
      "updatedAt": {
        "$ref": "#/components/schemas/Date"
      }
    }
  },
  "Maintenance": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "equipment": {
        "$ref": "#/components/schemas/Equipment",
        "nullable": true
      },
      "equipmentId": {
        "type": "string"
      },
      "description": {
        "type": "string"
      },
      "startDate": {
        "$ref": "#/components/schemas/Date"
      },
      "status": {
        "type": "string"
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      },
      "updatedAt": {
        "$ref": "#/components/schemas/Date"
      }
    }
  },
  "Procedure": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "name": {
        "type": "string"
      },
      "description": {
        "type": "string"
      },
      "type": {
        "type": "string",
        "enum": [
          "STANDARD",
          "START_OF_DAY",
          "END_OF_DAY",
          "EXCEPTION"
        ]
      },
      "questions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Question"
        },
        "nullable": true
      },
      "executions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Execution"
        },
        "nullable": true
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      },
      "updatedAt": {
        "$ref": "#/components/schemas/Date"
      }
    }
  },
  "Question": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "procedure": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "type": {
            "type": "string",
            "enum": [
              "STANDARD",
              "START_OF_DAY",
              "END_OF_DAY",
              "EXCEPTION"
            ]
          },
          "questions": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Question"
            },
            "nullable": true
          },
          "executions": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Execution"
            },
            "nullable": true
          },
          "createdAt": {
            "$ref": "#/components/schemas/Date"
          },
          "updatedAt": {
            "$ref": "#/components/schemas/Date"
          }
        },
        "nullable": true
      },
      "procedureId": {
        "type": "string"
      },
      "text": {
        "type": "string"
      },
      "answerType": {
        "type": "string",
        "enum": [
          "TEXT",
          "BOOLEAN",
          "CHOICE",
          "FILE_UPLOAD"
        ]
      },
      "order": {
        "type": "number"
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      },
      "updatedAt": {
        "$ref": "#/components/schemas/Date"
      },
      "type": {
        "type": "string",
        "enum": [
          "TEXT",
          "BOOLEAN",
          "CHOICE",
          "FILE_UPLOAD"
        ]
      }
    }
  },
  "RolePermission": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "role": {
        "type": "string",
        "enum": [
          "ADMINISTRATOR",
          "TRANSPORT_MANAGER",
          "AGENT",
          "DRIVER",
          "CLIENT_MANAGER",
          "WORKSHOP_MANAGER"
        ]
      },
      "permission": {
        "type": "string",
        "enum": [
          "CREATE_USER",
          "READ_USER",
          "UPDATE_USER",
          "DELETE_USER",
          "CREATE_CLIENT",
          "READ_CLIENT",
          "UPDATE_CLIENT",
          "DELETE_CLIENT",
          "MANAGE_ROLES",
          "CREATE_JOB",
          "READ_JOB",
          "UPDATE_JOB",
          "DELETE_JOB",
          "CREATE_MAINTENANCE",
          "READ_MAINTENANCE",
          "UPDATE_MAINTENANCE",
          "DELETE_MAINTENANCE",
          "VIEW_ASSIGNMENTS",
          "CREATE_ASSIGNMENT",
          "READ_ASSIGNMENT",
          "UPDATE_ASSIGNMENT",
          "DELETE_ASSIGNMENT",
          "CREATE_EQUIPMENT",
          "READ_EQUIPMENT",
          "UPDATE_EQUIPMENT",
          "DELETE_EQUIPMENT"
        ]
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      },
      "updatedAt": {
        "$ref": "#/components/schemas/Date"
      }
    }
  },
  "Session": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "userId": {
        "type": "string"
      },
      "token": {
        "type": "string"
      },
      "expiresAt": {
        "$ref": "#/components/schemas/Date"
      },
      "user": {
        "$ref": "#/components/schemas/User",
        "nullable": true
      }
    }
  },
  "Shaft": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "name": {
        "type": "string"
      },
      "area": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "site": {
            "$ref": "#/components/schemas/Site",
            "nullable": true
          },
          "siteId": {
            "type": "string"
          },
          "shafts": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Shaft"
            },
            "nullable": true
          },
          "createdAt": {
            "$ref": "#/components/schemas/Date"
          },
          "updatedAt": {
            "$ref": "#/components/schemas/Date"
          }
        },
        "nullable": true
      },
      "areaId": {
        "type": "string"
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      },
      "updatedAt": {
        "$ref": "#/components/schemas/Date"
      },
      "client": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "firstName": {
            "type": "string"
          },
          "lastName": {
            "type": "string"
          },
          "idNumber": {
            "type": "string"
          },
          "address": {
            "type": "string"
          },
          "contactNumber": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "whatsapp": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "potentialContactNumbers": {
            "type": "boolean"
          },
          "email": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "createdAt": {
            "$ref": "#/components/schemas/Date"
          },
          "updatedAt": {
            "$ref": "#/components/schemas/Date"
          },
          "shafts": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Shaft"
            },
            "nullable": true
          },
          "syndicates": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Syndicate"
            },
            "nullable": true
          },
          "Job": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Job"
            },
            "nullable": true
          },
          "status": {
            "type": "string",
            "enum": [
              "ACTIVE",
              "INACTIVE"
            ]
          }
        },
        "nullable": true
      },
      "clientId": {
        "type": "string"
      },
      "jobs": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Job"
        },
        "nullable": true
      }
    }
  },
  "Syndicate": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "name": {
        "type": "string"
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      },
      "updatedAt": {
        "$ref": "#/components/schemas/Date"
      },
      "clients": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Client"
        },
        "nullable": true
      }
    }
  },
  "Site": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "name": {
        "type": "string"
      },
      "address": {
        "type": "string"
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      },
      "updatedAt": {
        "$ref": "#/components/schemas/Date"
      },
      "areas": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Area"
        },
        "nullable": true
      }
    }
  },
  "Telematics": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "equipment": {
        "$ref": "#/components/schemas/Equipment",
        "nullable": true
      },
      "equipmentId": {
        "type": "string"
      },
      "kilometresTravelled": {
        "type": "number"
      },
      "lastUpdated": {
        "$ref": "#/components/schemas/Date"
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      },
      "updatedAt": {
        "$ref": "#/components/schemas/Date"
      }
    }
  },
  "User": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "email": {
        "type": "string"
      },
      "firstName": {
        "type": "string"
      },
      "lastName": {
        "type": "string"
      },
      "role": {
        "type": "string",
        "enum": [
          "ADMINISTRATOR",
          "TRANSPORT_MANAGER",
          "AGENT",
          "DRIVER",
          "CLIENT_MANAGER",
          "WORKSHOP_MANAGER"
        ]
      },
      "sessions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Session"
        },
        "nullable": true
      },
      "permissions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Permission"
        }
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      },
      "updatedAt": {
        "$ref": "#/components/schemas/Date"
      },
      "assignedJobs": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Job"
        },
        "nullable": true
      },
      "requestedJobs": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Job"
        },
        "nullable": true
      },
      "jobComments": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/JobComment"
        },
        "nullable": true
      },
      "executions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Execution"
        },
        "nullable": true
      },
      "Client": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Client"
        },
        "nullable": true
      },
      "createdPlans": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/DailyPlan"
        },
        "nullable": true
      }
    }
  },
  "Equipment": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "category": {
        "type": "string",
        "enum": [
          "TRAILER",
          "CRANE",
          "EXCAVATOR",
          "DOZER",
          "WEIGH_BRIDGE",
          "TELEMATICS_DEVICE",
          "VEHICLE",
          "CRUSHER",
          "MILL",
          "LOADER",
          "GENERATOR"
        ]
      },
      "type": {
        "$ref": "#/components/schemas/EquipmentType",
        "nullable": true
      },
      "typeId": {
        "type": "string"
      },
      "status": {
        "type": "string",
        "enum": [
          "AVAILABLE",
          "IN_TRANSIT",
          "IN_USE",
          "UNDER_MAINTENANCE",
          "OUT_OF_SERVICE"
        ]
      },
      "maintenanceRecords": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Maintenance"
        },
        "nullable": true
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      },
      "updatedAt": {
        "$ref": "#/components/schemas/Date"
      },
      "planAssignments": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/PlanAssignment"
        },
        "nullable": true
      }
    }
  },
  "EquipmentType": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "name": {
        "type": "string"
      },
      "equipment": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Equipment"
        },
        "nullable": true
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      },
      "updatedAt": {
        "$ref": "#/components/schemas/Date"
      }
    }
  },
  "VerificationCode": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "email": {
        "type": "string"
      },
      "code": {
        "type": "string"
      },
      "expiresAt": {
        "$ref": "#/components/schemas/Date"
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      }
    }
  },
  "DailyPlan": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "date": {
        "$ref": "#/components/schemas/Date"
      },
      "status": {
        "type": "string",
        "enum": [
          "DRAFT",
          "PUBLISHED",
          "COMPLETED",
          "CANCELLED"
        ]
      },
      "createdBy": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "firstName": {
            "type": "string"
          },
          "lastName": {
            "type": "string"
          },
          "role": {
            "type": "string",
            "enum": [
              "ADMINISTRATOR",
              "TRANSPORT_MANAGER",
              "AGENT",
              "DRIVER",
              "CLIENT_MANAGER",
              "WORKSHOP_MANAGER"
            ]
          },
          "sessions": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Session"
            },
            "nullable": true
          },
          "permissions": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Permission"
            }
          },
          "createdAt": {
            "$ref": "#/components/schemas/Date"
          },
          "updatedAt": {
            "$ref": "#/components/schemas/Date"
          },
          "assignedJobs": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Job"
            },
            "nullable": true
          },
          "requestedJobs": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Job"
            },
            "nullable": true
          },
          "jobComments": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/JobComment"
            },
            "nullable": true
          },
          "executions": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Execution"
            },
            "nullable": true
          },
          "Client": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Client"
            },
            "nullable": true
          },
          "createdPlans": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/DailyPlan"
            },
            "nullable": true
          }
        },
        "nullable": true
      },
      "createdById": {
        "type": "string"
      },
      "assignments": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/PlanAssignment"
        },
        "nullable": true
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      },
      "updatedAt": {
        "$ref": "#/components/schemas/Date"
      }
    }
  },
  "PlanAssignment": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "plan": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "date": {
            "$ref": "#/components/schemas/Date"
          },
          "status": {
            "type": "string",
            "enum": [
              "DRAFT",
              "PUBLISHED",
              "COMPLETED",
              "CANCELLED"
            ]
          },
          "createdBy": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "email": {
                "type": "string"
              },
              "firstName": {
                "type": "string"
              },
              "lastName": {
                "type": "string"
              },
              "role": {
                "type": "string",
                "enum": [
                  "ADMINISTRATOR",
                  "TRANSPORT_MANAGER",
                  "AGENT",
                  "DRIVER",
                  "CLIENT_MANAGER",
                  "WORKSHOP_MANAGER"
                ]
              },
              "sessions": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Session"
                },
                "nullable": true
              },
              "permissions": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Permission"
                }
              },
              "createdAt": {
                "$ref": "#/components/schemas/Date"
              },
              "updatedAt": {
                "$ref": "#/components/schemas/Date"
              },
              "assignedJobs": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Job"
                },
                "nullable": true
              },
              "requestedJobs": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Job"
                },
                "nullable": true
              },
              "jobComments": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/JobComment"
                },
                "nullable": true
              },
              "executions": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Execution"
                },
                "nullable": true
              },
              "Client": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Client"
                },
                "nullable": true
              },
              "createdPlans": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/DailyPlan"
                },
                "nullable": true
              }
            },
            "nullable": true
          },
          "createdById": {
            "type": "string"
          },
          "assignments": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/PlanAssignment"
            },
            "nullable": true
          },
          "createdAt": {
            "$ref": "#/components/schemas/Date"
          },
          "updatedAt": {
            "$ref": "#/components/schemas/Date"
          }
        },
        "nullable": true
      },
      "planId": {
        "type": "string"
      },
      "equipment": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "category": {
            "type": "string",
            "enum": [
              "TRAILER",
              "CRANE",
              "EXCAVATOR",
              "DOZER",
              "WEIGH_BRIDGE",
              "TELEMATICS_DEVICE",
              "VEHICLE",
              "CRUSHER",
              "MILL",
              "LOADER",
              "GENERATOR"
            ]
          },
          "type": {
            "$ref": "#/components/schemas/EquipmentType",
            "nullable": true
          },
          "typeId": {
            "type": "string"
          },
          "status": {
            "type": "string",
            "enum": [
              "AVAILABLE",
              "IN_TRANSIT",
              "IN_USE",
              "UNDER_MAINTENANCE",
              "OUT_OF_SERVICE"
            ]
          },
          "maintenanceRecords": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Maintenance"
            },
            "nullable": true
          },
          "createdAt": {
            "$ref": "#/components/schemas/Date"
          },
          "updatedAt": {
            "$ref": "#/components/schemas/Date"
          },
          "planAssignments": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/PlanAssignment"
            },
            "nullable": true
          }
        },
        "nullable": true
      },
      "equipmentId": {
        "type": "string"
      },
      "job": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "title": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "priority": {
            "type": "string",
            "enum": [
              "HIGH",
              "MEDIUM",
              "LOW"
            ]
          },
          "siteClassification": {
            "type": "string",
            "enum": [
              "GREEN",
              "ORANGE",
              "RED"
            ]
          },
          "status": {
            "type": "string",
            "enum": [
              "PENDING",
              "PLANNED",
              "BLOCKED",
              "IN_PROGRESS",
              "COMPLETED",
              "CANCELLED"
            ]
          },
          "attachments": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/JobAttachment"
            },
            "nullable": true
          },
          "comments": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/JobComment"
            },
            "nullable": true
          },
          "createdAt": {
            "$ref": "#/components/schemas/Date"
          },
          "updatedAt": {
            "$ref": "#/components/schemas/Date"
          },
          "shaft": {
            "$ref": "#/components/schemas/Shaft",
            "nullable": true
          },
          "shaftId": {
            "type": "string"
          },
          "client": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "firstName": {
                "type": "string"
              },
              "lastName": {
                "type": "string"
              },
              "idNumber": {
                "type": "string"
              },
              "address": {
                "type": "string"
              },
              "contactNumber": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "whatsapp": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "potentialContactNumbers": {
                "type": "boolean"
              },
              "email": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "createdAt": {
                "$ref": "#/components/schemas/Date"
              },
              "updatedAt": {
                "$ref": "#/components/schemas/Date"
              },
              "shafts": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Shaft"
                },
                "nullable": true
              },
              "syndicates": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Syndicate"
                },
                "nullable": true
              },
              "Job": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Job"
                },
                "nullable": true
              },
              "status": {
                "type": "string",
                "enum": [
                  "ACTIVE",
                  "INACTIVE"
                ]
              }
            },
            "nullable": true
          },
          "clientId": {
            "type": "string"
          },
          "planAssignment": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/PlanAssignment"
            },
            "nullable": true
          }
        },
        "nullable": true
      },
      "jobId": {
        "type": "string"
      },
      "order": {
        "type": "number"
      },
      "createdAt": {
        "$ref": "#/components/schemas/Date"
      },
      "updatedAt": {
        "$ref": "#/components/schemas/Date"
      }
    }
  }
};
