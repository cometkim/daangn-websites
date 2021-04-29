import * as React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import { global, styled } from 'gatsby-theme-stitches/src/stitches.config';
import { rem } from 'polished';

import Header from './layout/Header';
import _Footer from './layout/Footer';

const globalStyles = global({
  '*': {
    margin: 0,
    fontFamily: 'inherit',
  },
  'body': {
    fontFamily: 'sans-serif',
    textRendering: 'optimizeLegibility',
    wordBreak: 'break-word',
    WebkitFontSmoothing: 'antialiased'
  },
  'body:lang(ko)': {
    wordBreak: 'keep-all',
  },
  '@media (prefers-reduced-motion: no-preference)': {
    ':focus': {
      transition: 'outline-offset .25s ease',
      outlineOffset: '3px',
    },
  },
});

const Footer = styled(_Footer, {
  marginTop: rem(120),

  variants: {
    wide: {
      true: {
        marginTop: rem(160),
      },
    },
  },
});

const Main = styled('main', {
  paddingX: rem(24),

  variants: {
    wide: {
      true: {
        maxWidth: '$maxContent',
        margin: '0 auto',
      },
    },
  },
});

const Layout: React.FC = ({
  children,
}) => {
  globalStyles();

  const data = useStaticQuery<GatsbyTypes.LayoutStaticQuery>(graphql`
    query LayoutStatic {
      siteNavigation {
        ...Header_navigation
        ...Footer_navigation
      }
    }
  `);

  if (!data.siteNavigation) {
    throw new Error('SiteNavigation 노드가 없습니다.');
  }

  return (
    <>
      <Header navigation={data.siteNavigation} />
      <Main wide={{ '@sm': true }}>
        {children}
      </Main>
      <Footer
        navigation={data.siteNavigation}
        wide={{ '@sm': true }}
      />
    </>
  );
}

export default Layout;
