import { mapLink, useLinkParser } from '@karrotmarket/gatsby-theme-website/src/link';
import { graphql } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import { styled } from 'gatsby-theme-stitches/src/config';
import { rem } from 'polished';
import * as React from 'react';

import DetailLink from './DetailLink';

type PrismicTeamContentsDataCultureBodyTitleAndIllustrationProps = {
  data: GatsbyTypes.PrismicTeamContentsDataCultureBodyTitleAndIllustration_dataFragment;
  className?: string;
};

export const query = graphql`
  fragment PrismicTeamContentsDataCultureBodyTitleAndIllustration_data on PrismicTeamContentsDataCultureBodyTitleAndIllustration {
    primary {
      key_text
      title {
        text
      }
      inverted
      illustration {
        alt
        localFile {
          childImageSharp {
            gatsbyImageData(
              width: 560
              layout: FULL_WIDTH
            )
          }
        }
      }
      link {
        url
      }
    }
  }
`;

const Container = styled('section', {
  contentArea: true,
  width: '100%',
  display: 'grid',
  gap: rem(60),
  gridTemplateAreas: ['"title"', '"illust"'].join('\n'),

  '@md': {
    gap: rem(40),
    gridTemplateColumns: '1fr 1fr',
  },

  variants: {
    alignTitle: {
      left: {
        '@md': {
          gridTemplateAreas: ['"title illust"'].join('\n'),
        },
      },
      right: {
        '@md': {
          gridTemplateAreas: ['"illust title"'].join('\n'),
        },
      },
    },
  },
});

const TitleContainer = styled('div', {
  gridArea: 'title',
  display: 'grid',
  gridTemplateRows: 'repeat(3, min-content)',
});

const KeyText = styled('span', {
  typography: '$body2',
  fontWeight: 'bold',
  marginBottom: rem(16),

  '@md': {
    typography: '$subtitle3',
    marginBottom: rem(24),
  },
});

const Title = styled('h1', {
  whiteSpace: 'pre-line',
  typography: '$subtitle2',
  marginBottom: rem(24),

  '@md': {
    typography: '$heading4',
    marginBottom: rem(32),
  },
});

const Illustration = styled(GatsbyImage, {
  gridArea: 'illust',
});

const PrismicTeamContentsDataCultureBodyTitleAndIllustration: React.FC<
  PrismicTeamContentsDataCultureBodyTitleAndIllustrationProps
> = ({ data }) => {
  const parseLink = useLinkParser();

  if (data.primary == null) {
    return null;
  }

  const image =
    data.primary.illustration?.localFile?.childImageSharp?.gatsbyImageData &&
    getImage(data.primary.illustration.localFile.childImageSharp.gatsbyImageData);
  const link = data.primary.link?.url && parseLink(data.primary.link.url);

  return (
    <Container alignTitle={data.primary.inverted === true ? 'right' : 'left'}>
      <TitleContainer>
        <KeyText>{data.primary.key_text}</KeyText>
        <Title>{data.primary.title?.text}</Title>
        {link && <DetailLink link={link} />}
      </TitleContainer>
      {image && <Illustration image={image} alt={data.primary.illustration?.alt || ''} />}
    </Container>
  );
};

export default PrismicTeamContentsDataCultureBodyTitleAndIllustration;
