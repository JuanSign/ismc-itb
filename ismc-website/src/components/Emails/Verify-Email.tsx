import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components';

interface VerifyEmailProps {
  confirmLink: string;
}

const FOOTER_URL = `${process.env.CDN_URL}/email/footer.jpg`;

export const VerifyEmailTemplate = ({ confirmLink }: VerifyEmailProps) => (
  <Html>
    <Head />
    <Preview>Confirm your email address for ISMC XV</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section>
           <Img
            src={FOOTER_URL}
            width="100%"
            alt="ISMC XV Footer"
            style={{ maxWidth: '100%' }}
          />
        </Section>
        <Heading style={h1}>Confirm your email address</Heading>
        <Text style={text}>
          Welcome to ISMC XV! Please click the button below to verify your email address and complete your registration.
        </Text>
        
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button
            style={button}
            href={confirmLink}
          >
            Verify Email
          </Button>
        </Section>

        <Text style={text}>
          If the button doesn&apos;t work, copy and paste this URL into your browser:
        </Text>

        <Section style={codeBox}>
          <Text style={confirmationCodeText}>
            {confirmLink}
          </Text>
        </Section>

        <Hr style={hr} />
        <Text style={footerText}>
          © 2024 ISMC XV. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
  padding: '0',
};

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '26px',
  textAlign: 'center' as const,
  padding: '0 40px',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',     
  maxWidth: '210px', 
  padding: '12px 0', 
  margin: '0 auto',  
};

const codeBox = {
  background: '#f4f4f4',
  borderRadius: '4px',
  border: '1px solid #e6ebf1',
  width: '90%',     
  margin: '16px auto',
  padding: '12px',
  tableLayout: 'fixed' as const,
};

const confirmationCodeText = {
  fontSize: '12px',
  textAlign: 'center' as const,
  verticalAlign: 'middle',
  display: 'inline-block',
  color: '#555',
  wordBreak: 'break-all' as const,
  margin: 0,
  fontFamily: 'monospace',
  lineHeight: '1.4',
  maxWidth: '100%',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  marginTop: '20px',
};

export default VerifyEmailTemplate;