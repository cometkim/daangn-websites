import React from "react";
import { styled } from "gatsby-theme-stitches/src/stitches.config";
import { graphql } from "gatsby";

import { Html } from "@src/components/Html";
import { Flex } from "@src/components/Flex";
import { Space } from "@src/components/Space";

// @ts-ignore
import { ReactComponent as KarrotIcon } from "@src/icons/karrot.svg";

type ParallaxIconType = "Karrot";
const ParallaxIcon: { [key in ParallaxIconType]: React.FC } = {
    Karrot: KarrotIcon,
};

type ParallaxSectionProps = {
    content: GatsbyTypes.PrismicGlobalContentsBodyParallaxSection;
};

export const query = graphql`
    fragment ParallaxSection_content on PrismicGlobalContentsBodyParallaxSection {
        primary {
            title {
                html
            }
            top_icon
            top_text {
                text
            }
            background_image {
                url
            }
        }
    }
`;

const Section = styled("section", {
    height: "400px",
    width: "100%",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "180%",
    backgroundAttachment: "fixed",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    "@md": {
        backgroundSize: "cover",
        height: "600px",
    },
});

const Container = styled("div", {
    width: "$maxContent",
    margin: "0 auto",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
});

const TopText = styled("div", {
    fontSize: "$body1",
    "@md": {
        fontSize: "$subtitle3",
    },
});

const ParallaxSection: React.FC<ParallaxSectionProps> = ({ content }) => {
    if (!content.primary) return <></>;

    const { title, top_icon, top_text, background_image } = content.primary;
    const TopIcon = ParallaxIcon[top_icon as ParallaxIconType];

    return (
        <Section css={{ backgroundImage: `url(${background_image?.url})` }}>
            <Container>
                <Flex rowCenterY>
                    <TopIcon></TopIcon>
                    <Space w={4}></Space>
                    <TopText>{top_text?.text}</TopText>
                </Flex>
                <Space h={12}></Space>
                <Html html={title?.html as string}></Html>
            </Container>
        </Section>
    );
};

export default ParallaxSection;