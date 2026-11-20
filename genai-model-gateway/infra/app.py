import aws_cdk as cdk
from stacks.genai_gateway_stack import GenAIGatewayStack

app = cdk.App()

GenAIGatewayStack(
    app,
    "GenAIGatewayStack",
    env=cdk.Environment(account="415744340135", region="ap-southeast-2"),
)

app.synth()
