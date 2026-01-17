import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://oppavenue.com';

const WebsiteSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Opp Avenue',
    alternateName: 'OppAvenue',
    url: SITE_URL,
    description: 'Your trusted platform for discovering exciting career opportunities in the railway industry and connecting talented professionals with leading companies.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export default WebsiteSchema;
