import styled from 'styled-components/native';

interface PropsInterface {
  margin: number | null;
}

export const Spacer = styled.View`
  margin-top: ${(props: PropsInterface) => (props.margin ? `${props.margin / 2}px` : '4px')};
  margin-bottom: ${(props: PropsInterface) => (props.margin ? `${props.margin / 2}px` : '4px')};
`;
