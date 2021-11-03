import * as React from 'react';
import type { PageProps } from 'gatsby';
import { graphql, navigate } from 'gatsby';
import { styled } from 'gatsby-theme-stitches/src/config';
import { GatsbySeo } from 'gatsby-plugin-next-seo';
import { rem } from 'polished';
import { required } from '@cometjs/core';
import type { PropOf, RefOf } from '@cometjs/react-utils';
import { mapAbstractType } from '@cometjs/graphql-utils';

import _PageTitle from '~/components/PageTitle';
import _FormField from '~/components/FormField';
import Button from '~/components/Button';
import _Spinner from '~/components/Spinner';

import type { ApplicationForm } from '~/utils/applicationForm';
import { makeClient, makeEndpoint, makeNewEndpoint } from '~/utils/applicationForm';
import * as Base64 from '~/utils/base64';

type JobApplicationPageProps = PageProps<GatsbyTypes.JobApplicationPageCQQuery, GatsbyTypes.SitePageContext>;

export const query = graphql`
  query JobApplicationPageCQ($id: String!) {
    ...DefaultLayout_query
    ...JobPostLayout_query
    jobPost(id: { eq: $id }) {
      ghId
      title
      portfolioRequired
      parentJob {
        questions {
          __typename
          name
          label
          required
          description
          ...on GreenhouseJobBoardJobQuestionForYesNo {
            options {
              label
              value
            }
          }
          ...on GreenhouseJobBoardJobQuestionForSingleSelect {
            options {
              label
              value
            }
          }
          ...on GreenhouseJobBoardJobQuestionForMultiSelect {
            options {
              label
              value
            }
          }
        }
      }
    }
    privacyPolicy: prismicTermsAndConditions(uid: { eq: "job-application-privacy" }) {
      id
      data {
        content {
          html
        }
      }
    }
    sensitiveInfoPolicy: prismicTermsAndConditions(uid: { eq: "job-application-sensitive" }) {
      id
      data {
        content {
          html
        }
      }
    }
  }
`;

type State = (
  | 'initial'
  | 'invalid'
  | 'fetching'
  | 'completed'
);

type Action = (
  | 'INVALID'
  | 'FETCH_START'
  | 'FETCH_COMPLETE'
);

const initialState: State = 'initial';

const reducer: React.Reducer<State, Action> = (state, action) => {
  switch (action) {
    case 'INVALID': {
      switch (state) {
        case 'initial':
        case 'fetching':
        case 'invalid': {
          return 'invalid';
        }
      }
      break;
    }

    case 'FETCH_START': {
      switch (state) {
        case 'initial':
        case 'invalid': {
          return 'fetching';
        }
      }
      break;
    }

    case 'FETCH_COMPLETE': {
      if (state === 'fetching') {
        return 'completed';
      }
      break;
    }
  }
  return state;
};

const Form = styled('form', {
});

const FormField = styled(_FormField, {
  marginBottom: rem(32),
});

const FormHelpText = styled('p', {
  color: '$gray600',
  fontSize: '$caption1',
  marginBottom: rem(48),
});

const Spinner = styled(_Spinner, {
  height: '50%',
});

const greenhouseAcceptedMimeTypes = [
  'text/plain',
  'application/rtf',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const JobApplicationPage: React.FC<JobApplicationPageProps> = ({
  data,
}) => {
  required(data.jobPost);

  const [state, dispatch] = React.useReducer(reducer, initialState);

  const jobApplicationFormEndpoint = makeNewEndpoint(
    process.env.GATSBY_JOB_APPLICATION_FORM_HOST || 'http://localhost:8787',
    data.jobPost.ghId,
  );

  type FormRef = RefOf<typeof Form>;
  const formRef = React.useRef<FormRef>(null);

  type SubmitHandler = NonNullable<PropOf<typeof Form, 'onSubmit'>>;
  const handleSubmit: SubmitHandler = e => {
    e.preventDefault();

    if (!formRef.current) {
      return;
    }

    const formData = new FormData(formRef.current);

    const applicationForm: ApplicationForm = {
      phoneNumber: formData.get('phone_number') as string,
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      resume: formData.get('resume') as File,
      portfolio: formData.get('portfolio') as File,
      veterans: formData.get('veterans') as string,
      disability: formData.get('disability') as string,
      alternativeCivilian: formData.get('alternative_civilian') as string,
    };

    (async () => {
      required(data.jobPost);

      const client = makeClient({
        fetch,
        endpoint: jobApplicationFormEndpoint,
        encodeFile: async file => {
          const content = await Base64.fromBlob(file);
          return { content, filename: file.name };
        },
        portfolioRequired: data.jobPost.portfolioRequired,
      });

      if (client.validate(applicationForm)) {
        dispatch('FETCH_START');

        try {
          const response = await client.submit(applicationForm);

          if (response.ok) {
            dispatch('FETCH_COMPLETE');
            window.alert('지원서가 제출되었습니다. 빠른 시일 내에 검토 후 연락드리겠습니다 :)');
          } else {
            dispatch('INVALID');
            const message = await response.text();
            window.alert(message);
          }
        } catch (e) {
          console.error(e);
          window.alert('지원서 제출에 실패했습니다. 문제가 지속되는 경우 recruit@daangn.com 으로 문의주시면 도움 드리겠습니다.');
        }
      } else {
        dispatch('INVALID');
      }
    })();
  };

  React.useEffect(() => {
    required(data.jobPost);

    if (state === 'completed') {
      navigate('/completed/');
    }
  }, [state]);

  const portfolioField = data.jobPost.parentJob.questions.find(question => question.name === 'cover_letter');

  return (
    <Form
      ref={formRef}
      method="post"
      action={jobApplicationFormEndpoint}
      onSubmit={handleSubmit}
    >
      <GatsbySeo noindex />
      <FormField
        variants={{ type: 'text' }}
        name="first_name"
        label="이름"
        placeholder="지원자 이름을 입력해주세요."
        required
      />
      {/* Treat the first_name as fullname */}
      <input type="hidden" name="last_name" value={"\u200b"} />
      <FormField
        variants={{ type: 'tel' }}
        name="phone"
        label="전화번호"
        placeholder="연락 가능한 전화번호를 입력해주세요."
        required
      />
      <FormField
        variants={{ type: 'email' }}
        name="email"
        label="이메일"
        placeholder="이메일 주소를 입력해주세요."
        required
      />
      <FormField
        variants={{
          type: 'file',
          accepts: greenhouseAcceptedMimeTypes,
        }}
        name="resume"
        label="이력서 및 경력기술서"
        description="파일은 pdf, doc, docx, txt, rtf 형식만 사용할 수 있습니다."
        placeholder="파일 첨부하기"
        required
      />
      {portfolioField && (
        <FormField
          variants={{
            type: 'file',
            accepts: greenhouseAcceptedMimeTypes,
          }}
          name={portfolioField.name}
          label="포트폴리오"
          description="포트폴리오는 최대 50MB까지 업로드 가능해요."
          placeholder="파일 첨부하기"
          required={portfolioField.required}
        />
      )}
      {data.jobPost.parentJob.questions
        // Note: Custom Question 만 따로 렌더링
        .filter(question => question.name.startsWith('question'))
        .map(question => mapAbstractType(question, {
        GreenhouseJobBoardJobQuestionForShortText: question => (
          <FormField
            variants={{ type: 'text' }}
            key={question.name}
            name={question.name}
            label={question.label}
            required={question.required}
          />
        ),
        GreenhouseJobBoardJobQuestionForLongText: question => (
          <FormField
            variants={{ type: 'longtext' }}
            key={question.name}
            name={question.name}
            label={question.label}
            required={question.required}
          />
        ),
        GreenhouseJobBoardJobQuestionForAttachment: question => (
          <FormField
            variants={{
              type: 'file',
              accepts: greenhouseAcceptedMimeTypes,
            }}
            placeholder="파일 첨부하기"
            key={question.name}
            name={question.name}
            label={question.label}
            required={question.required}
          />
        ),
        GreenhouseJobBoardJobQuestionForYesNo: question => (
          <FormField
            variants={{
              type: 'select',
              options: [...question.options],
            }}
            key={question.name}
            name={question.name}
            label={question.label}
            required={question.required}
          />
        ),
        GreenhouseJobBoardJobQuestionForSingleSelect: question => (
          <FormField
            variants={{
              type: 'select',
              options: [...question.options],
            }}
            key={question.name}
            name={question.name}
            label={question.label}
            required={question.required}
          />
        ),
        GreenhouseJobBoardJobQuestionForMultiSelect: question => (
          <FormField
            variants={{
              type: 'select',
              options: [...question.options],
            }}
            key={question.name}
            name={question.name}
            label={question.label}
            required={question.required}
          />
        ),
      }))}
      {data.privacyPolicy?.data?.content?.html && (
        <FormField
          variants={{
            type: 'terms',
            terms: data.privacyPolicy.data.content.html,
          }}
          name="privacy"
          label="개인정보 수집 및 이용동의"
          required
        />
      )}
      {data.sensitiveInfoPolicy?.data?.content?.html && (
        <FormField
          variants={{
            type: 'terms',
            terms: data.sensitiveInfoPolicy.data.content.html,
          }}
          name="sensitive"
          label="민감정보 수집 및 이용동의"
          required
        />
      )}
      <Button
        as="button"
        type="primary"
        fullWidth
        disabled={state === 'fetching'}
      >
        {state === 'fetching' ? (
          <Spinner />
        ) : (
          '동의 후 제출하기'
        )}
      </Button>
    </Form>
  );
};

export default JobApplicationPage;
