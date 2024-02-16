import {
	ActionBar,
	Card,
	PageBlock,
	PageDetailLayout,
	usePageMetadata,
	useQuery,
	useRouteParams,
} from "@vendure/admin-ui/react";
import { kebabCase } from "lodash";
import React, { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	GetPageDocument,
	GetPagesDocument,
	PageFragment,
} from "../generated-admin-types";
import { dateFormat } from "../utils/format";

type PageFormTypeProps = {
	title: string;
	slug: string;
	content: string;

	status: string;
	show_in_nav: boolean;
	parent?: string;

	meta_description: string;
	sort_order: number;
};

export default function PageDetailComponent() {
	const { params } = useRouteParams();
	const { data, loading } = useQuery(GetPageDocument, { id: params.id });

	const { data: pagesData } = useQuery(GetPagesDocument, {
		options: { filter: { id: { notEq: params.id } } },
	});
	const pages = pagesData?.pages.items || [];

	const { setBreadcrumb, setTitle } = usePageMetadata();

	const isNew = useMemo(() => params.id === "create", [params.id]);

	const page = data?.page;

	useEffect(() => {
		if (loading || !data) return;

		const page = data?.page;

		if (page) {
			setTitle(page.title);
			setBreadcrumb([
				{ label: "Pages", link: ["/extensions/pages"] },
				{ label: page.title, link: [] },
			]);
		} else {
			setTitle("Create new Page");
			setBreadcrumb([
				{ label: "Pages", link: ["/extensions/pages"] },
				{ label: "Create new Page", link: [] },
			]);
		}
	}, [loading, data, setTitle, setBreadcrumb]);

	const form = useForm<PageFormTypeProps>({
		defaultValues: page ? mapToForm(page) : createBlank(),
	});

	const { register, control, watch, setValue } = form;

	const title = watch("title");

	useEffect(() => {
		if (title && isNew) {
			setValue("slug", kebabCase(title));
		}
	}, [title, setValue, isNew]);

  useEffect(() => {
    if (page) {
      form.reset(mapToForm(page))
    }
  }, [page])

	return (
		<>
			<PageBlock>
				<ActionBar>
					<button className="btn btn-primary">
						{!isNew ? "Update" : "Create"}
					</button>
				</ActionBar>
			</PageBlock>

			<PageDetailLayout
				sidebar={
					<>
						{!isNew && (
							<Card>
								<div>
									<div className="property">
										<div className="prop-label">ID:</div>
										<div className="value">{page?.id}</div>
									</div>
									<div className="property">
										<div className="prop-label">Created At:</div>
										<div className="value">{dateFormat(page?.createdAt)}</div>
									</div>
									<div className="property">
										<div className="prop-label">Updated At:</div>
										<div className="value">{dateFormat(page?.updatedAt)}</div>
									</div>
								</div>
							</Card>
						)}
					</>
				}
			>
				<PageBlock>
					<Card title="Page Details">
						<div className="form-grid">
							<div className="form-group">
								<label htmlFor="title">Title</label>
								<div className="input-row">
									<input type="text" id="title" {...register("title")} />
								</div>
							</div>
							<div className="form-group">
								<label htmlFor="slug">Slug</label>
								<div className="input-row">
									<input type="text" id="slug" {...register("slug")} />
								</div>
							</div>
						</div>
					</Card>

					<Card title="Navigation Menu Options">
						<div className="form-grid">
							<div className="form-group">
								<label htmlFor="show_in_nav">Navigation Menu</label>
								<div className="input-row">
									<input
										type="checkbox"
										id="show_in_nav"
										{...register("show_in_nav")}
									/>
									<span className="ml-1">
										Show this webpage in navigation menu
									</span>
								</div>
							</div>
							<div className="form-group">
								<label htmlFor="parent">Parent Page</label>
								<div className="input-row">
									<Controller
										control={control}
										name="parent"
										render={({ field }) => (
											<select {...field} id="parent">
												<option value="">--No Parent Page--</option>
												{pages.map((page) => (
													<option key={page.id} value={page.id}>
														{page.title}
													</option>
												))}
											</select>
										)}
									></Controller>
								</div>
							</div>
						</div>
					</Card>

					<Card title="Advanced Options">
						<div className="form-grid">
							<div className="form-group"></div>
						</div>
					</Card>
				</PageBlock>
			</PageDetailLayout>
		</>
	);
}

function createBlank(): PageFormTypeProps {
	return {
		title: "",
		slug: "",
		content: "",
		status: "",
		show_in_nav: false,
		parent: "",
		meta_description: "",
		sort_order: 0,
	};
}

function mapToForm(page: PageFragment): PageFormTypeProps {
	return {
		title: page.title,
		slug: page.slug,
		content: page.content,
		status: page.status,
		show_in_nav: page.show_in_nav,
		parent: page.parent?.id,
		meta_description: page.meta_description,
		sort_order: page.sort_order,
	};
}
