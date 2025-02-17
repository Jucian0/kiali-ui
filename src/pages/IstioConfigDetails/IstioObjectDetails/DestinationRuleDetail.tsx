import * as React from 'react';
import { DestinationRule, ObjectValidation } from '../../../types/IstioObjects';
import LocalTime from '../../../components/Time/LocalTime';
import DetailObject from '../../../components/Details/DetailObject';
import { Link } from 'react-router-dom';
import {
  Card,
  CardBody,
  Grid,
  GridItem,
  Stack,
  StackItem,
  Text,
  TextVariants,
  TooltipPosition
} from '@patternfly/react-core';
import { Table, TableBody, TableHeader, TableVariant } from '@patternfly/react-table';
import GlobalValidation from '../../../components/Validations/GlobalValidation';
import { ServiceIcon } from '@patternfly/react-icons';
import { checkForPath } from '../../../types/ServiceInfo';
import ValidationList from '../../../components/Validations/ValidationList';
import Labels from '../../../components/Label/Labels';

interface DestinationRuleProps {
  namespace: string;
  destinationRule: DestinationRule;
  validation?: ObjectValidation;
}

class DestinationRuleDetail extends React.Component<DestinationRuleProps> {
  globalStatus() {
    const validation = this.props.validation;
    if (validation && !validation.valid) {
      return <GlobalValidation validation={validation} />;
    } else {
      return undefined;
    }
  }

  subsetValidation(subsetIndex: number) {
    const checks = checkForPath(this.props.validation, 'spec/subsets[' + subsetIndex + ']');
    return <ValidationList checks={checks} tooltipPosition={TooltipPosition.right} />;
  }

  columnsSubsets() {
    return [
      {
        title: 'Status',
        props: {}
      },
      {
        title: 'Name',
        props: {}
      },
      {
        title: 'Labels',
        props: {}
      },
      {
        title: 'Traffic Policy',
        props: {}
      }
    ];
  }

  rowsSubset() {
    const subsets = this.props.destinationRule.spec.subsets || [];
    return subsets.map((subset, index) => ({
      cells: [
        { title: this.subsetValidation(index) },
        { title: subset.name },
        { title: <Labels key={'subset-labels-' + index} labels={subset.labels} /> },
        { title: <DetailObject name="" detail={subset.trafficPolicy} /> }
      ]
    }));
  }

  generateSubsets() {
    const subsets = this.props.destinationRule.spec.subsets || [];
    const hasSubsets = subsets.length > 0;

    return (
      <GridItem>
        <Card>
          <CardBody>
            <>
              <Text component={TextVariants.h2}>Subsets</Text>
              {hasSubsets ? (
                <Table
                  aria-label={'DestinationRule SubSets table'}
                  variant={TableVariant.compact}
                  cells={this.columnsSubsets()}
                  rows={this.rowsSubset()}
                >
                  <TableHeader />
                  <TableBody />
                </Table>
              ) : (
                <Text component={TextVariants.p}>No subsets defined.</Text>
              )}
            </>
          </CardBody>
        </Card>
      </GridItem>
    );
  }

  serviceLink(namespace: string, host: string, isValid: boolean): any {
    if (!host) {
      return '-';
    }
    // TODO Full FQDN are not linked yet, it needs more checks in crossnamespace scenarios + validation of target
    if (host.indexOf('.') > -1 || !isValid) {
      return host;
    } else {
      return (
        <Link to={'/namespaces/' + namespace + '/services/' + host}>
          {host + ' '}
          <ServiceIcon />
        </Link>
      );
    }
  }

  rawConfig() {
    const destinationRule = this.props.destinationRule;
    const globalStatus = this.globalStatus();
    const isValid = !globalStatus;
    return (
      <GridItem span={6}>
        <Card>
          <CardBody>
            <Text component={TextVariants.h2}>Destination Rule Overview</Text>
            {globalStatus}
            <Stack>
              <StackItem id={'created_at'}>
                <Text component={TextVariants.h3}>Created at</Text>
                <LocalTime time={destinationRule.metadata.creationTimestamp || ''} />
              </StackItem>
              <StackItem id={'resource_version'}>
                <Text component={TextVariants.h3}>Resource Version</Text>
                {destinationRule.metadata.resourceVersion}
              </StackItem>
              <StackItem id={'hosts'}>
                {destinationRule.spec.host && (
                  <>
                    <Text component={TextVariants.h3}>Host</Text>
                    {this.serviceLink(destinationRule.metadata.namespace || '', destinationRule.spec.host, isValid)}
                  </>
                )}
              </StackItem>
            </Stack>
          </CardBody>
        </Card>
      </GridItem>
    );
  }

  trafficPolicy() {
    const destinationRule = this.props.destinationRule;
    const hasTrafficPolicy = !!destinationRule.spec.trafficPolicy;

    return (
      <GridItem span={6}>
        <Card>
          <CardBody>
            <Text component={TextVariants.h2}>Traffic Policy</Text>
            <Stack>
              <StackItem id={'traffic_policy'}>
                {hasTrafficPolicy ? (
                  <DetailObject name="" detail={destinationRule.spec.trafficPolicy} />
                ) : (
                  <Text component={TextVariants.p}>No traffic policy defined.</Text>
                )}
              </StackItem>
            </Stack>
          </CardBody>
        </Card>
      </GridItem>
    );
  }

  render() {
    return (
      <div className="container-fluid container-cards-pf">
        <Grid gutter={'md'}>
          {this.rawConfig()}
          {this.trafficPolicy()}
          {this.generateSubsets()}
        </Grid>
      </div>
    );
  }
}

export default DestinationRuleDetail;
