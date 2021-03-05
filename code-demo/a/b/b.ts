import * as React from 'react';
import { WrappedBigSelect } from '@src/features/common/BigSelect';
import { Button, Row, Col } from 'antd';
import * as actions from '../redux/actions';
import { IRootState } from '@src/types';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import ProcessTree from '../ProcessTree';
import Form, { FormItem, IFormProps, IFormRenderProps } from '@src/features/common/Form';
import { isEqual } from 'lodash';
import AddTags from '../../common/AddTags';
import { IFilterProps } from '@features/common/Filter';
import * as JobColumns from '../JobListColumns';
import SelectUser from '@src/features/jobs/SelectUser';
import SelectUserSearch from '@src/features/jobs/SelectUserSearch';

import { JobAudit, Closed, Audit } from '@src/features/jobs/selectors';
import AuditFlowModal from '@src/features/common/AuditFlowModal';
import { BusinessRulesTitle } from '../consts';
import SelectInterviewer from './components/SelectInterviewer';
import './style.less';
import { i18nTranslate } from '@src/utils';

type Options = Array<{ label: string; value: string }>;
export interface IBusinessRulesProps extends IFilterProps {
  status: string;
  jobSteps: number[];
  approvalPersons?: Array<[{ name: string; avatar: string; email: string }]>;
  positionAuditOptions?: Options;
  offerAuditOptions?: Options;
}
export interface IBusiniessState {}

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type Props = StateProps & DispatchProps & IBusinessRulesProps;

class BusinessRules extends React.Component<Props, IBusiniessState> {
  public form: Form;
  public noformProps: IFormProps['noformProps'] = {
    validateConfig: {
      recruitLeaderNumber: { required: true },
      recruitEmailCode: { required: true },
      positionAuditProcessId: { required: true },
      finalInterviewerCode: { required: true }
    }
  };
  public noformCoreProps: IFormProps['noformCoreProps'] = {
    onChange: ([key], value, core) => {
      const { departmentCode } = this.props.jobDraft;
      if (key === 'offerAuditProcessId') {
        this.props.actions.doAuditProcess(value[key], 'offer', departmentCode);
      }
      if (key === 'positionAuditProcessId') {
        this.props.actions.doAuditProcess(value[key], 'position', departmentCode);
      }
    }
  };
  constructor(props: Props) {
    super(props);
  }
  public componentDidUpdate = (prevProps: Props) => {
    const { value = {} } = this.props;
    if (!isEqual(prevProps.value, value)) {
      this.props.actions.doAuditProcessChange('offer', value.offerAuditProcess || {});
      this.props.actions.doAuditProcessChange('position', value.positionAuditProcess || {});
    }
  };
  public componentDidMount = () => {
    const { status, value = {} } = this.props;
    this.props.actions.doAuditProcessChange('offer', value.offerAuditProcess || {});
    this.props.actions.doAuditProcessChange('position', value.positionAuditProcess || {});
    if (status) {
      if (this.form) {
        this.form.core.setGlobalStatus(
          status === Audit || status === Closed || status === JobAudit ? 'disabled' : 'edit'
        );
      }
    }
  };
  public getForm = (form: Form) => {
    this.form = form;
  };
  public onNextStep = () => {
    if (
      this.props.status === Audit ||
      this.props.status === Closed ||
      this.props.status === JobAudit
    ) {
      if (this.props.onSubmit) {
        this.props.onSubmit(this.props.value);
      }
    } else {
      this.form.submit().then(values => {
        if (this.props.onSubmit) {
          const {
            id: positionAuditProcessId,
            code: positionAuditProcessCode
          } = this.props.positionProcess;
          const { id: offerAuditProcessId, code: offerAuditProcessCode } = this.props.offerProcess;
          this.props.onSubmit({
            ...values,
            positionAuditProcessId,
            positionAuditProcessCode,
            offerAuditProcessId,
            offerAuditProcessCode,
            offerAuditProcess: this.props.offerProcess,
            positionAuditProcess: this.props.positionProcess
          });
        }
      });
    }
  };
  public Render = (props: IFormRenderProps) => {
    const { status } = this.props;
    const pageClass = this.props.status === JobAudit ? 'k-job-audit-business' : 'k-job-business';
    const { optionsMap } = this.props;
    return (
      <div className={pageClass}>
        {status === JobAudit ? null : (
          <div className="k-jobs-footer">
            <Button type="default" className="k-jobs-button" onClick={this.onNextStep}>
              下一步
            </Button>
          </div>
        )}
        <div className="k-business-body">
          <Row>
            <Col span={12}>
              <h4>{BusinessRulesTitle}</h4>
            </Col>
          </Row>
          <FormItem
            label={JobColumns.recruitLeaderInfo.title}
            name="recruitLeaderNumber"
            key="recruitLeaderNumber"
            required
          >
            <SelectUserSearch valueType="number" placeholder="" />
          </FormItem>
          <FormItem
            label={JobColumns.recruitEmailInfo.title}
            name="recruitEmailCode"
            key="recruitEmailCode"
            defaultValue="recruiting"
            required
          >
            <WrappedBigSelect
              simpleValue={true}
              placeholder=""
              options={this.props.optionsMap && this.props.optionsMap.recruitEmailCode}
            />
          </FormItem>
          <FormItem
            name="positionManagers"
            label={i18nTranslate('job.edit.positionManagers', '职位管理者')}
            className="business-managers"
          >
            <AddTags
              placeHolder=""
              title={JobColumns.positionManagersInfo.title}
              type={{
                userSelect: {
                  name: 'positionManagerName',
                  numberName: 'positionManagerNumber'
                }
              }}
            />
          </FormItem>
          <FormItem
            name="finalInterviewerCode"
            label={i18nTranslate('job.edit.finalInterviewerCode', '终面官')}
            required
            className="business-final-interviewer"
          >
            <WrappedBigSelect
              simpleValue={true}
              options={optionsMap && optionsMap.finalInterviewerCode}
              placeholder=""
            />
          </FormItem>
          {status === JobAudit ? null : (
            <div className="business-positionaudit">
              <FormItem
                name="positionAuditProcessId"
                label={i18nTranslate('job.edit.positionAuditProcessId', '职位审核流程')}
                required
              >
                <WrappedBigSelect
                  simpleValue={true}
                  placeholder=""
                  clearable={false}
                  options={this.props.positionAuditOptions}
                />
              </FormItem>
              <AuditFlowModal
                process={this.props.positionProcess}
                editNode={<i className="kiconfont k-icon-edit business-edit-process" />}
                type="position"
              />
              <ProcessTree processItems={this.props.positionProcess.processItems || []} />
            </div>
          )}
          <div className="business-offeraudit">
            <FormItem
              label={
                <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                  {i18nTranslate('job.edit.offerAuditProcessId', 'offer审核流程')}
                  <span style={{ color: '#1e80f0' }}>
                    {i18nTranslate(
                      'job.edit.offerAuditProcessId.tips',
                      '（一线可选填，非一线自动生成审核流不需填写）'
                    )}
                  </span>
                </span>
              }
              name="offerAuditProcessId"
              key="offerApproval"
            >
              <WrappedBigSelect
                simpleValue={true}
                placeholder=""
                clearable={false}
                options={this.props.offerAuditOptions}
              />
            </FormItem>
          </div>
          <ProcessTree processItems={this.props.offerProcess.processItems || []} />
          <FormItem
            name="interviewers"
            label={
              <span style={{ whiteSpace: 'nowrap' }}>
                {i18nTranslate('job.edit.interviewers', '简历初筛面试官')}
                <span style={{ fontSize: '12px', color: '#aaa' }}>
                  {i18nTranslate('job.edit.interviewers.tips', '能直接参与本职位的简历初筛')}
                </span>
              </span>
            }
            className="business-interviewers"
          >
            <SelectInterviewer />
          </FormItem>
        </div>
      </div>
    );
  };
  public format = (values: any) => {
    return {
      ...values
    };
  };
  public render() {
    return (
      <Form
        Render={this.Render}
        getForm={this.getForm}
        // cc:jobs-indexpage#4; 设置-表单值
        noformProps={{
          ...this.noformProps,
          value: this.format(this.props.value)
        }}
        noformCoreProps={this.noformCoreProps}
      />
    );
  }
}

function mapStateToProps(state: IRootState, ownProps: IBusinessRulesProps) {
  return {
    optionsMap: state.common.jobsOptionsMap,
    isHr: !!state.common.isHr,
    positionAuditOptions: state.jobs.positionAuditOptions,
    offerAuditOptions: state.jobs.offerAuditOptions,
    offerProcess: state.jobs.offerProcess || {},
    positionProcess: state.jobs.positionProcess || {},
    jobDraft: state.jobs.jobDraft
  };
}

/* istanbul ignore next */
function mapDispatchToProps(dispatch: Dispatch, ownProps: IBusinessRulesProps) {
  return {
    actions: bindActionCreators({ ...actions }, dispatch)
  };
}

export default connect<StateProps, DispatchProps, IBusinessRulesProps>(
  mapStateToProps,
  mapDispatchToProps
)(BusinessRules);
