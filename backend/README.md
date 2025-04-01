# Backend Architecture

The backend for this application consists of two main actors:

## 1. Profile Actor

Handles user profile management:
- Creating profiles with username and bio
- Retrieving profiles
- Authentication checks

## 2. Events Actor

Handles events and tickets:
- Creating and managing events
- Ticket types and their capacities
- Minting tickets
- Verifying tickets
- QR code generation for tickets

## Types Module

Contains shared types used by both actors:
- Profile related types
- Event and ticket related types
- Response types with proper error handling

## Development

To deploy the backend:

```bash
dfx deploy
```

This will deploy both the profile and events canisters to your local replica.

## Integration with Frontend

The frontend interacts with these canisters through the declarations generated during deployment. Each function returns a properly typed response that includes error handling to facilitate a robust user experience.

## Security Considerations

- All operations that modify state check caller identity
- Event organizers have special permissions for their events
- Tickets are verified by event organizers only
- Each ticket has unique metadata and verification 