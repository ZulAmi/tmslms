# 🔐 TMSLMS Enterprise Authentication System

A comprehensive enterprise-grade authentication system built with NextAuth.js, featuring multi-factor authentication, audit logging, and role-based access control.

## 🚀 Features

### Core Authentication

- **Multi-Provider Support**: Email/password, Google OAuth, Microsoft OAuth, SAML
- **Enterprise Integration**: SSO, LDAP/Active Directory compatibility
- **Session Management**: Secure JWT-based sessions with refresh tokens
- **Password Security**: BCrypt hashing, strength validation, history tracking

### Multi-Factor Authentication (MFA)

- **TOTP Support**: Time-based one-time passwords (Google Authenticator, Authy)
- **SMS/Email**: Fallback MFA options for accessibility
- **Hardware Tokens**: Support for YubiKey and other FIDO devices
- **Backup Codes**: Secure recovery codes for account access
- **Device Management**: Add, remove, and manage multiple MFA devices

### Security & Compliance

- **Audit Logging**: Comprehensive security event tracking
- **Risk Assessment**: Behavioral analysis and suspicious activity detection
- **Account Protection**: Automatic lockout and rate limiting
- **Session Security**: Device fingerprinting and geolocation tracking
- **RBAC**: Role-based access control with fine-grained permissions

## 📁 Project Structure

```
packages/auth/
├── lib/
│   ├── auth.ts              # NextAuth.js configuration
│   ├── auth-utils.ts        # Authentication utilities
│   └── mfa.ts              # MFA utilities and functions
├── components/
│   ├── MFASetup.tsx        # MFA device setup component
│   ├── MFAManagement.tsx   # MFA device management
│   └── MFAVerification.tsx # MFA login verification
├── pages/
│   ├── signin.tsx          # Custom sign-in page
│   └── register.tsx        # User registration page
├── api/
│   └── mfa/
│       ├── setup/route.ts  # MFA device setup endpoint
│       └── devices/route.ts # MFA device management
├── middleware.ts           # Authentication middleware
└── package.json           # Package dependencies
```

## 🛠️ Installation & Setup

### 1. Database Migration

```bash
cd packages/database
npx prisma migrate dev --name add-enterprise-auth-system
npx prisma generate
```

### 2. Environment Configuration

Copy the environment template and configure:

```bash
cp .env.example .env
```

Required environment variables:

```env
# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here-at-least-32-characters-long"
NEXTAUTH_URL="http://localhost:3001"

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tmslms"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"
```

### 3. Package Installation

```bash
cd packages/auth
npm install
```

Dependencies installed:

- `next-auth@4.24.7` - Authentication framework
- `@next-auth/prisma-adapter@1.0.7` - Database adapter
- `bcryptjs@2.4.3` - Password hashing
- `otplib@12.0.1` - TOTP generation/verification
- `qrcode@1.5.3` - QR code generation

## 🔧 Integration

### Next.js App Router

1. **API Route Handler**:

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/packages/auth/lib/auth";
export const { GET, POST } = handlers;
```

2. **Middleware**:

```typescript
// app/middleware.ts
export { default } from "@/packages/auth/middleware";
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

3. **Session Provider**:

```tsx
// app/layout.tsx
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

### Using Components

```tsx
import { MFASetup } from "@/packages/auth/components/MFASetup";
import { MFAManagement } from "@/packages/auth/components/MFAManagement";
import { useSession } from "next-auth/react";

function SecuritySettings() {
  const { data: session } = useSession();

  return (
    <div>
      <h2>Security Settings</h2>
      <MFAManagement />
    </div>
  );
}
```

## 🔐 Authentication Flow

### 1. Sign In Process

```mermaid
graph TD
    A[User Sign In] --> B{Provider?}
    B -->|Email/Password| C[Credentials Check]
    B -->|OAuth| D[OAuth Flow]
    C --> E{MFA Required?}
    D --> E
    E -->|Yes| F[MFA Challenge]
    E -->|No| G[Create Session]
    F --> H{MFA Valid?}
    H -->|Yes| G
    H -->|No| I[Access Denied]
    G --> J[Redirect to App]
```

### 2. MFA Setup Flow

```mermaid
graph TD
    A[Start MFA Setup] --> B[Generate TOTP Secret]
    B --> C[Display QR Code]
    C --> D[User Scans QR Code]
    D --> E[User Enters Code]
    E --> F{Code Valid?}
    F -->|Yes| G[Save Device]
    F -->|No| H[Show Error]
    G --> I[Generate Backup Codes]
    I --> J[Setup Complete]
    H --> E
```

## 🛡️ Security Features

### Multi-Factor Authentication

```typescript
// Generate MFA setup
const setup = await generateMFASetup(userEmail);
console.log(setup.qrCodeDataURL); // QR code for authenticator app
console.log(setup.backupCodes); // Backup recovery codes

// Verify TOTP code
const isValid = verifyTOTPCode(userCode, secret);
```

### Role-Based Access Control

```typescript
// Middleware protection
const protectedRoutes = {
  "/admin": ["ADMIN", "SUPER_ADMIN"],
  "/instructor": ["INSTRUCTOR", "ADMIN"],
  "/student": ["STUDENT", "INSTRUCTOR", "ADMIN"],
};

// Component-level protection
const { data: session } = useSession();
const hasAdminAccess = session?.user?.role === "ADMIN";
```

### Audit Logging

```typescript
// Automatic logging for all auth events
await logSecurityEvent(
  userId,
  "LOGIN_SUCCESS",
  "User signed in successfully",
  request,
  { provider: "credentials", mfaUsed: true }
);
```

## 📊 Database Schema

### Core Authentication Tables

- **Account**: OAuth account linking
- **Session**: Active user sessions
- **User**: User profiles and settings
- **MFADevice**: Multi-factor authentication devices
- **SecurityEvent**: Audit logs and security events
- **AuthenticationLog**: Detailed authentication history
- **PasswordPolicy**: Organization password requirements
- **PasswordHistory**: Previous password tracking

### Key Relationships

```sql
User 1:N Account       -- OAuth accounts
User 1:N Session       -- Active sessions
User 1:N MFADevice     -- MFA devices
User 1:N SecurityEvent -- Security events
User 1:N PasswordHistory -- Password history
```

## 🔄 API Endpoints

### Authentication

- `GET /api/auth/signin` - Sign in page
- `POST /api/auth/signin` - Process sign in
- `POST /api/auth/register` - User registration
- `POST /api/auth/signout` - Sign out

### MFA Management

- `POST /api/auth/mfa/setup` - Setup new MFA device
- `GET /api/auth/mfa/devices` - List user's MFA devices
- `DELETE /api/auth/mfa/devices/:id` - Remove MFA device
- `POST /api/auth/mfa/devices/:id/primary` - Set primary device

### Security

- `GET /api/auth/security/events` - Security event history
- `GET /api/auth/security/sessions` - Active sessions
- `POST /api/auth/security/sessions/:id/revoke` - Revoke session

## 🧪 Testing

### Development Headers

For testing API endpoints during development:

```bash
curl -X POST http://localhost:3001/api/auth/mfa/setup \
  -H "Content-Type: application/json" \
  -H "x-user-id: user123" \
  -H "x-user-email: test@example.com" \
  -d '{"deviceName":"Test Device","deviceType":"TOTP","secret":"secret","verificationCode":"123456"}'
```

### MFA Testing

```typescript
// Test TOTP generation and verification
import { generateMFASetup, verifyTOTPCode } from "./lib/mfa";

const setup = await generateMFASetup("test@example.com");
const code = authenticator.generate(setup.secret);
const isValid = verifyTOTPCode(code, setup.secret);
```

## 🔧 Configuration

### NextAuth.js Options

```typescript
export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      // Custom credentials logic with MFA
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      // Custom JWT logic
    },
    session: async ({ session, token }) => {
      // Session customization
    },
  },
  events: {
    signIn: async ({ user, account, profile }) => {
      // Audit logging
    },
  },
};
```

### Middleware Configuration

```typescript
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

## 🚀 Production Deployment

### Security Checklist

- [ ] Generate secure `NEXTAUTH_SECRET` (32+ characters)
- [ ] Configure HTTPS-only cookies in production
- [ ] Set up proper CORS policies
- [ ] Enable rate limiting
- [ ] Configure monitoring and alerting
- [ ] Set up backup procedures for MFA recovery
- [ ] Review audit log retention policies
- [ ] Test account lockout mechanisms

### Environment Variables

```env
# Production settings
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
SESSION_MAX_AGE=86400
MFA_CODE_EXPIRY=300
ACCOUNT_LOCKOUT_ATTEMPTS=5
```

## 📈 Monitoring

### Security Metrics

- Authentication success/failure rates
- MFA adoption rates
- Account lockout incidents
- Suspicious activity detection
- Session duration analysis

### Logging

All security events are logged with:

- User ID and email
- Event type and description
- IP address and user agent
- Timestamp and metadata
- Risk assessment scores

## 🤝 Contributing

1. Follow security best practices
2. Add tests for new features
3. Update documentation
4. Review security implications
5. Test with multiple MFA devices

## 📄 License

[Your license information]

---

Built with ❤️ for enterprise security and user experience.
