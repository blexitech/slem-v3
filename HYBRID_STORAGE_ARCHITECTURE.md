# Hybrid Storage Architecture: Arweave + Supabase

This document explains the hybrid storage architecture implemented in the SLE Marketplace application, combining decentralized storage (Arweave) with centralized database (Supabase).

## Architecture Overview

The application uses a hybrid approach where:
- **Sensitive user data** is stored on **Arweave** (decentralized, permanent)
- **Reference data** is stored on **Supabase** (centralized, fast queries)

## Data Distribution

### Supabase (Centralized - Fast Queries)
```sql
user_references table:
- id (wallet address) - PRIMARY KEY
- arweave_url - URL to Arweave transaction
- created_at - timestamp
- updated_at - timestamp
```

### Arweave (Decentralized - Permanent Storage)
```json
{
  "type": "user-profile-sensitive",
  "version": "1.0.0",
  "timestamp": 1234567890,
  "data": {
    "fullName": "John Doe",
    "username": "johndoe",
    "dateOfBirth": "1990-01-01",
    "email": "john@example.com",
    "metadata": {
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastUpdated": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## Benefits of This Architecture

### Arweave Benefits:
- **Permanent Storage**: Data cannot be deleted or modified
- **Decentralized**: No single point of failure
- **Censorship Resistant**: Cannot be taken down
- **Privacy**: Sensitive data is not on centralized servers
- **Cost Effective**: One-time payment for permanent storage

### Supabase Benefits:
- **Fast Queries**: Quick lookups by wallet address
- **Relational Data**: Easy to query and join with other data
- **Real-time**: Live updates and subscriptions
- **Authentication**: Built-in user management
- **Backup & Recovery**: Traditional database features

## Implementation Details

### File Structure:
```
lib/
├── arweave.js              # Core Arweave functionality
├── arweave-config.js       # Arweave configuration
├── supabase.js             # Supabase client and functions
└── useHybridUser.js        # React hook for hybrid operations

app/actions/
└── hybrid-user-actions.js  # Server actions for hybrid operations

components/UIs/
└── GreetingBox.jsx         # Updated component using hybrid approach
```

### Data Flow:

1. **User Creates Profile**:
   ```
   User Input → Arweave (sensitive data) → Supabase (reference)
   ```

2. **User Retrieves Profile**:
   ```
   Wallet Address → Supabase (get arweave_url) → Arweave (get sensitive data)
   ```

3. **User Updates Profile**:
   ```
   New Data → Arweave (new transaction) → Supabase (update arweave_url)
   ```

## Setup Instructions

### 1. Environment Variables
Create `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Arweave (optional)
NEXT_PUBLIC_ARWEAVE_GATEWAY=https://arweave.net
NEXT_PUBLIC_ARWEAVE_PROTOCOL=https
NEXT_PUBLIC_ARWEAVE_PORT=443
NEXT_PUBLIC_ARWEAVE_APP_NAME=SLE-Marketplace
NEXT_PUBLIC_ARWEAVE_APP_VERSION=3.0.0
```

### 2. Supabase Setup
1. Create a new Supabase project
2. Run the SQL schema from `supabase-schema.sql`
3. Get your project URL and anon key
4. Add them to your environment variables

### 3. Dependencies
```bash
npm install @supabase/supabase-js arweave
```

## Usage Examples

### Creating a User Profile:
```javascript
import { useHybridUser } from '../lib/useHybridUser';

const { createOrUpdateProfile } = useHybridUser();

const userData = {
  address: "0x123...",
  fullName: "John Doe",
  username: "johndoe",
  dateOfBirth: "1990-01-01",
  email: "john@example.com"
};

const result = await createOrUpdateProfile(userData);
// Result includes both Arweave URL and Supabase reference
```

### Retrieving a User Profile:
```javascript
const { searchProfile } = useHybridUser();

const result = await searchProfile("0x123...");
// Returns combined data from both Supabase and Arweave
```

## Security Considerations

### Data Privacy:
- Sensitive data (name, email, DOB) is stored on Arweave
- Only wallet address and Arweave URL are stored on Supabase
- Arweave data is permanent and cannot be deleted

### Access Control:
- Users can only access their own data
- Wallet address serves as the primary identifier
- No centralized authentication required for data access

### Data Integrity:
- Arweave provides cryptographic proof of data integrity
- Supabase provides fast reference lookups
- Data cannot be tampered with once stored on Arweave

## Cost Analysis

### Arweave Costs:
- One-time payment for permanent storage
- ~$0.01-0.10 per MB depending on network conditions
- No recurring fees

### Supabase Costs:
- Free tier: 500MB database, 50MB file storage
- Pro tier: $25/month for 8GB database
- Very cost-effective for reference data

## Error Handling

The system includes comprehensive error handling:

1. **Arweave Failures**: If Arweave upload fails, the entire operation fails
2. **Supabase Failures**: If Supabase fails after Arweave success, data is still accessible via Arweave URL
3. **Network Issues**: Retry mechanisms and fallback strategies
4. **Data Validation**: Input validation before storage

## Future Enhancements

### Potential Improvements:
1. **Data Encryption**: Encrypt sensitive data before storing on Arweave
2. **Batch Operations**: Upload multiple profiles efficiently
3. **Caching**: Cache frequently accessed data
4. **Analytics**: Track storage usage and costs
5. **Backup Strategy**: Regular backups of Supabase references
6. **Data Migration**: Tools to migrate between storage systems

### Advanced Features:
1. **File Uploads**: Store images/files on Arweave
2. **Data Versioning**: Track changes over time
3. **Cross-Chain**: Support multiple blockchain networks
4. **Privacy Controls**: User-controlled data sharing

## Monitoring & Maintenance

### Health Checks:
- Monitor Arweave network status
- Check Supabase connection health
- Validate data integrity between systems

### Backup Strategy:
- Supabase: Built-in backup and point-in-time recovery
- Arweave: Data is permanent, no backup needed
- References: Export Supabase data regularly

## Troubleshooting

### Common Issues:
1. **Arweave Upload Fails**: Check network connection and wallet balance
2. **Supabase Connection Error**: Verify environment variables
3. **Data Not Found**: Check if profile exists in Supabase first
4. **Slow Queries**: Optimize Supabase indexes

### Debug Tools:
- Arweave transaction explorer: `https://arweave.net/{transaction_id}`
- Supabase dashboard for database queries
- Browser network tab for API calls

This hybrid architecture provides the best of both worlds: the permanence and decentralization of Arweave with the speed and reliability of Supabase for reference data.
