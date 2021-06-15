import React from "react";

import { rem } from "polished";
import { graphql, PageProps } from "gatsby";
import { GatsbySeo } from "gatsby-plugin-next-seo";
import { mapAbstractType } from "@cometjs/graphql-utils";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { withPrismicPreview } from "gatsby-plugin-prismic-previews";

import { styled } from "../../gatsby-theme-stitches/stitches.config";

import { Space } from "../Space";
import Layout from "../Layout";
import DetailsList from "../about/DetailsList";
import SubtitleAndText from "../about/SubtitleAndText";
import SubtitleAndLinks from "../about/SubtitleAndLinks";
import SubtitleAndImages from "../about/SubtitleAndImages";

type AboutPageProps = PageProps<GatsbyTypes.AboutPageQueryQuery>;

export const query = graphql`
  query AboutPageQuery($lang: String) {
    prismicSiteNavigation(uid: { eq: "global" }, lang: { eq: $lang }) {
      _previewable
      ...DefaultLayout_data
    }
    prismicGlobalContents(lang: { eq: $lang }) {
      _previewable
      data {
        about_page_title
        about_page_description
        about_opengraph_image_link

        about_title {
          text
        }
        about_background_image {
          localFile {
            childImageSharp {
              gatsbyImageData(quality: 100)
            }
          }
        }
        about_body {
          __typename
          ...SubtitleAndImages_content
          ...SubtitleAndLinks_content
          ...SubtitleAndText_content
          ...DetailsList_content
        }
      }
    }
  }
`;

const AboutPage: React.FC<AboutPageProps> = ({ data }) => {
  if (!data.prismicGlobalContents?.data?.about_body) throw new Error("No data");

  const {
    about_page_title,
    about_page_description,
    about_opengraph_image_link,
    about_background_image,
    about_title,
    about_body,
  } = data.prismicGlobalContents?.data;

  const backgroundImage = getImage(
    about_background_image?.localFile?.childImageSharp?.gatsbyImageData as any
  );

  return (
    <Layout id="about-page" data={data.prismicSiteNavigation.data}>
      <GatsbySeo
        title={about_page_title}
        description={about_page_description}
        openGraph={{
          images: about_opengraph_image_link
            ? [
                {
                  url: about_opengraph_image_link,
                },
              ]
            : [],
          title: about_page_title,
          description: about_page_description,
        }}
      />
      <BackgroundImage image={backgroundImage}></BackgroundImage>
      <Container>
        <Title>{about_title.text}</Title>

        {about_body.map((content: any, i) =>
          mapAbstractType(content, {
            PrismicGlobalContentsDataAboutBodySubtitleAndText: (content) => (
              <SubtitleAndText key={i} content={content} />
            ),
            PrismicGlobalContentsDataAboutBodySubtitleAndImages: (content) => (
              <SubtitleAndImages key={i} content={content} />
            ),
            PrismicGlobalContentsDataAboutBodySubtitleAndLinks: (content) => (
              <SubtitleAndLinks key={i} content={content} />
            ),
            PrismicGlobalContentsDataAboutBodyDetailsList: (content) => (
              <DetailsList key={i} content={content} />
            ),
          })
        )}
      </Container>
      <Space h={100}></Space>
    </Layout>
  );
};

const BackgroundImage = styled(GatsbyImage, {
  height: "208px",
  width: "100%",
  img: {
    objectPosition: "bottom 0 right 5%",
    "@md": {
      objectPosition: "center",
    },
  },

  "@md": {
    height: "440px",
  },
});

const Container = styled("div", {
  height: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  padding: `0 ${rem(24)}`,

  "@md": {
    width: rem(668),
  },
});

const Title = styled("h1", {
  fontSize: "$heading4",
  lineHeight: "$heading4",
  marginTop: rem(36),
  "@md": {
    fontSize: "$heading3",
    lineHeight: "$heading3",
    marginTop: rem(60),
  },
});

export default withPrismicPreview(AboutPage, []);
