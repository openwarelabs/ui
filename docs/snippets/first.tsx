import { Button, Card, Field, Input, Stack, toast } from "@openwarelabs/ui";

export function NewProject() {
    return (
        <Card padding="lg">
            <Stack gap="xl">
                <Field label="Project name" hint="Letters, numbers and dashes.">
                    <Input placeholder="recipe-app" />
                </Field>
                <Stack direction="row" gap="sm" justify="end">
                    <Button>Cancel</Button>
                    <Button variant="primary" onClick={() => toast.success("Project created")}>
                        Create project
                    </Button>
                </Stack>
            </Stack>
        </Card>
    );
}
